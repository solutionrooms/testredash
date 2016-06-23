from flask_script import Manager, prompt_pass
from peewee import IntegrityError

from redash import models
from redash.handlers.users import invite_user

manager = Manager(help="Users management commands. This commands assume single organization operation.")


def build_groups(groups, is_admin):
    org = models.Organization.get_by_slug('default')
    if isinstance(groups, basestring):
        groups= groups.split(',')
        groups.remove('') # in case it was empty string
        groups = [int(g) for g in groups]

    if groups is None:
        groups = [org.default_group.id]

    if is_admin:
        groups += [org.admin_group.id]

    return groups

@manager.option('email', help="email address of the user to grant admin to")
def grant_admin(email):
    try:
        org = models.Organization.get_by_slug('default')
        admin_group = org.admin_group
        user = models.User.get_by_email_and_org(email, org)

        if admin_group.id in user.groups:
            print "User is already an admin."
        else:
            user.groups.append(org.admin_group.id)
            user.save()

            print "User updated."
    except models.User.DoesNotExist:
        print "User [%s] not found." % email


@manager.option('email', help="User's email")
@manager.option('name', help="User's full name")
@manager.option('--admin', dest='is_admin', action="store_true", default=False, help="set user as admin")
@manager.option('--google', dest='google_auth', action="store_true", default=False, help="user uses Google Auth to login")
@manager.option('--password', dest='password', default=None, help="Password for users who don't use Google Auth (leave blank for prompt).")
@manager.option('--groups', dest='groups', default=None, help="Comma seperated list of groups (leave blank for default).")
def create(email, name, groups, is_admin=False, google_auth=False, password=None):
    print "Creating user (%s, %s)..." % (email, name)
    print "Admin: %r" % is_admin
    print "Login with Google Auth: %r\n" % google_auth

    org = models.Organization.get_by_slug('default')
    groups = build_groups(groups, is_admin)

    user = models.User(org=org, email=email, name=name, groups=groups)
    if not google_auth:
        password = password or prompt_pass("Password")
        user.hash_password(password)

    try:
        user.save()
    except Exception, e:
        print "Failed creating user: %s" % e.message


@manager.option('email', help="email address of user to delete")
def delete(email):
    deleted_count = models.User.delete().where(models.User.email == email).execute()
    print "Deleted %d users." % deleted_count


@manager.option('password', help="new password for the user")
@manager.option('email', help="email address of the user to change password for")
def password(email, password):
    try:
        user = models.User.get_by_email_and_org(email, models.Organization.get_by_slug('default'))

        user.hash_password(password)
        user.save()

        print "User updated."
    except models.User.DoesNotExist:
        print "User [%s] not found." % email


@manager.option('email', help="The invitee's email")
@manager.option('name', help="The invitee's full name")
@manager.option('inviter_email', help="The email of the inviter")
@manager.option('--admin', dest='is_admin', action="store_true", default=False, help="set user as admin")
@manager.option('--groups', dest='groups', default=None, help="Comma seperated list of groups (leave blank for default).")
def invite(email, name, inviter_email, groups, is_admin=False):
    org = models.Organization.get_by_slug('default')
    groups = build_groups(groups, is_admin)
    try:
        user_from = models.User.get_by_email_and_org(inviter_email, org)
        user = models.User(org=org, name=name, email=email, groups=groups)

        try:
            user.save()
            invite_url = invite_user(org, user_from, user)
            print "An invitation was sent to [%s] at [%s]." % (name, email)
        except IntegrityError as e:
            if "email" in e.message:
                print "Cannot invite. User already exists [%s]" % email
            else:
                print e
    except models.User.DoesNotExist:
        print "The inviter [%s] was not found." % inviterEmail


@manager.command
def list():
    """List all users"""
    for i, user in enumerate(models.User.select()):
        if i > 0:
            print "-" * 20

        print "Id: {}\nName: {}\nEmail: {}".format(user.id, user.name.encode('utf-8'), user.email)
