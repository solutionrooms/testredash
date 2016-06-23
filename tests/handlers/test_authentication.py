from tests import BaseTestCase
import mock
import time
from redash.models import User
from redash.authentication.account import invite_token
from tests.handlers import get_request, post_request


class TestInvite(BaseTestCase):
    def test_expired_invite_token(self):

        with mock.patch('time.time') as patched_time:
            patched_time.return_value = time.time() - (7 * 24 * 3600) - 10
            token = invite_token(self.factory.user)

        response = get_request('/invite/{}'.format(token), org=self.factory.org)
        self.assertEqual(response.status_code, 400)

    def test_invalid_invite_token(self):
        response = get_request('/invite/badtoken', org=self.factory.org)
        self.assertEqual(response.status_code, 400)

    def test_valid_token(self):
        token = invite_token(self.factory.user)
        response = get_request('/invite/{}'.format(token), org=self.factory.org)
        self.assertEqual(response.status_code, 200)

    def test_already_active_user(self):
        pass


class TestInvitePost(BaseTestCase):
    def test_empty_password(self):
        token = invite_token(self.factory.user)
        response = post_request('/invite/{}'.format(token), data={'password': ''}, org=self.factory.org)
        self.assertEqual(response.status_code, 400)

    def test_invalid_password(self):
        token = invite_token(self.factory.user)
        response = post_request('/invite/{}'.format(token), data={'password': '1234'}, org=self.factory.org)
        self.assertEqual(response.status_code, 400)

    def test_bad_token(self):
        response = post_request('/invite/{}'.format('jdsnfkjdsnfkj'), data={'password': '1234'}, org=self.factory.org)
        self.assertEqual(response.status_code, 400)

    def test_already_active_user(self):
        pass

    def test_valid_password(self):
        token = invite_token(self.factory.user)
        password = 'test1234'
        response = post_request('/invite/{}'.format(token), data={'password': password}, org=self.factory.org)
        self.assertEqual(response.status_code, 302)
        self.factory.user = User.get_by_id(self.factory.user.id)
        self.assertTrue(self.factory.user.verify_password(password))

