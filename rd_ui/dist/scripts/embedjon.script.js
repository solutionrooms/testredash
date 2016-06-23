angular.module("redash", ["redash.directives", "redash.admin_controllers", "redash.controllers", "redash.filters", "redash.services", "redash.visualization", "plotly", "angular-growl", "angularMoment", "ui.bootstrap", "ui.sortable", "smartTable.table", "ngResource", "ngRoute", "ui.select", "naif.base64", "ui.bootstrap.showErrors", "ngSanitize"]).config(["$routeProvider", "$locationProvider", "$compileProvider", "growlProvider", "uiSelectConfig", function (e, t, r, n, i) {
        i.theme = "bootstrap", r.aHrefSanitizationWhitelist(/^\s*(https?|http|data):/), t.html5Mode(!0), n.globalTimeToLive(2e3), e.when("/embedjon/query/:queryId/visualization/:visualizationId", {
            templateUrl: "/views/visualization-embed.html",
            controller: "EmbedCtrl",
            reloadOnSearch: !1
        }), e.otherwise({
            redirectTo: "/embedjon"
        })
    }]).controller("EmbedCtrl", ["$scope", function (e) {}]).controller("EmbeddedVisualizationCtrl", ["$scope", "$location", "Query", "QueryResult", function (e, t, r, n) {
        e.showQueryDescription = t.search().showDescription, e.embed = !0, e.visualization = visualization, e.query = visualization.query, query = new r(visualization.query), e.queryResult = new n({
            query_result: query_result
        })
    }]),
    function () {
        "use strict";

        function e() {
            this.bind = function (e) {
                _.forEach(e, function (e, t) {
                    Mousetrap.bindGlobal(t, function (t) {
                        t.preventDefault(), e()
                    })
                })
            }, this.unbind = function (e) {
                _.forEach(e, function (e, t) {
                    Mousetrap.unbind(t)
                })
            }
        }

        function t(e) {
            this.events = [], this.post = _.debounce(function () {
                var t = this.events;
                this.events = [], e.post("api/events", t)
            }, 1e3), this.record = function (e, t, r, n, i) {
                var a = {
                    user_id: e.id,
                    action: t,
                    object_type: r,
                    object_id: n,
                    timestamp: Date.now() / 1e3
                };
                _.extend(a, i), this.events.push(a), this.post()
            }
        }
        angular.module("redash.services", []).service("KeyboardShortcuts", [e]).service("Events", ["$http", t])
    }(),
    function () {
        function e(e) {
            this.errorMessage = e
        }
        e.prototype.getError = function () {
            return this.errorMessage
        }, e.prototype.getStatus = function () {
            return "failed"
        }, e.prototype.getData = function () {
            return null
        }, e.prototype.getLog = function () {
            return null
        }, e.prototype.getChartData = function () {
            return null
        };
        var t = function (e, t, r) {
                function n(e) {
                    this.deferred = r.defer(), this.job = {}, this.query_result = {}, this.status = "waiting", this.filters = void 0, this.filterFreeze = void 0, this.updatedAt = moment(), e && o.apply(this, [e])
                }
                var i = e("api/query_results/:id", {
                        id: "@id"
                    }, {
                        post: {
                            method: "POST"
                        }
                    }),
                    a = e("api/jobs/:id", {
                        id: "@id"
                    }),
                    o = function (e) {
                        if (angular.extend(this, e), "query_result" in e) {
                            this.status = "done", this.filters = void 0, this.filterFreeze = void 0;
                            var t = {};
                            _.each(this.query_result.data.rows, function (e) {
                                _.each(e, function (r, n) {
                                    angular.isNumber(r) ? t[n] = "float" : _.isString(r) && r.match(/^\d{4}-\d{2}-\d{2}T/) ? (e[n] = moment.utc(r), t[n] = "datetime") : _.isString(r) && r.match(/^\d{4}-\d{2}-\d{2}$/) ? (e[n] = moment.utc(r), t[n] = "date") : "object" == typeof r && null !== r && (e[n] = JSON.stringify(r))
                                }, this)
                            }, this), _.each(this.query_result.data.columns, function (e) {
                                t[e.name] && (null != e.type && "string" != e.type || (e.type = t[e.name]))
                            }), this.deferred.resolve(this)
                        } else 3 == this.job.status ? this.status = "processing" : this.status = void 0
                    },
                    s = {
                        1: "waiting",
                        2: "processing",
                        3: "done",
                        4: "failed"
                    };
                n.prototype.update = o, n.prototype.getId = function () {
                    var e = null;
                    return "query_result" in this && (e = this.query_result.id), e
                }, n.prototype.cancelExecution = function () {
                    a["delete"]({
                        id: this.job.id
                    })
                }, n.prototype.getStatus = function () {
                    return this.status || s[this.job.status]
                }, n.prototype.getError = function () {
                    return "None" != this.job.error ? this.job.error : void 0
                }, n.prototype.getLog = function () {
                    return this.query_result.data && this.query_result.data.log && 0 != this.query_result.data.log.length ? this.query_result.data.log : null
                }, n.prototype.getUpdatedAt = function () {
                    return this.query_result.retrieved_at || 1e3 * this.job.updated_at || this.updatedAt
                }, n.prototype.getRuntime = function () {
                    return this.query_result.runtime
                }, n.prototype.getRawData = function () {
                    if (!this.query_result.data) return null;
                    var e = this.query_result.data.rows;
                    return e
                }, n.prototype.getData = function () {
                    if (!this.query_result.data) return null;
                    var e = function (e) {
                            return e ? _.reduce(e, function (e, t) {
                                return e + t.current
                            }, "") : null
                        },
                        t = this.getFilters(),
                        r = e(t);
                    return this.filterFreeze != r && (this.filterFreeze = r, t ? this.filteredData = _.filter(this.query_result.data.rows, function (e) {
                        return _.reduce(t, function (t, r) {
                            return _.isArray(r.current) || (r.current = [r.current]), t && _.some(r.current, function (t) {
                                return t == e[r.name] || String(e[r.name]) == t
                            })
                        }, !0)
                    }) : this.filteredData = this.query_result.data.rows), this.filteredData
                }, n.prototype._addPointToSeries = function (e, t, r) {
                    void 0 == t[r] && (t[r] = {
                        name: r,
                        type: "column",
                        data: []
                    }), t[r].data.push(e)
                }, n.prototype.getChartData = function (e) {
                    var t = {};
                    return _.each(this.getData(), function (r) {
                        var n = {},
                            i = void 0,
                            a = 0,
                            o = {};
                        _.each(r, function (t, r) {
                            var s = r.split("::")[0] || r.split("__")[0],
                                u = r.split("::")[1] || r.split("__")[1];
                            e && (u = e[r]), "unused" != u && ("x" == u && (a = t, n[u] = t), "y" == u && (null == t && (t = 0), o[s] = t, n[u] = t), "series" == u && (i = String(t)), "multiFilter" != u && "multi-filter" != u || (i = String(t)))
                        }), void 0 === i ? _.each(o, function (e, r) {
                            this._addPointToSeries({
                                x: a,
                                y: e
                            }, t, r)
                        }.bind(this)) : this._addPointToSeries(n, t, i)
                    }.bind(this)), _.values(t)
                }, n.prototype.getColumns = function () {
                    return void 0 == this.columns && this.query_result.data && (this.columns = this.query_result.data.columns), this.columns
                }, n.prototype.getColumnNames = function () {
                    return void 0 == this.columnNames && this.query_result.data && (this.columnNames = _.map(this.query_result.data.columns, function (e) {
                        return e.name
                    })), this.columnNames
                }, n.prototype.getColumnNameWithoutType = function (e) {
                    var t;
                    if (-1 != e.indexOf("::")) t = "::";
                    else {
                        if (-1 == e.indexOf("__")) return e;
                        t = "__"
                    }
                    var r = e.split(t);
                    return "" == r[0] && 2 == r.length ? r[1] : r[0]
                }, n.prototype.getColumnCleanName = function (e) {
                    var t = this.getColumnNameWithoutType(e);
                    return t
                }, n.prototype.getColumnFriendlyName = function (e) {
                    return this.getColumnNameWithoutType(e).replace(/(?:^|\s)\S/g, function (e) {
                        return e.toUpperCase()
                    })
                }, n.prototype.getColumnCleanNames = function () {
                    return _.map(this.getColumnNames(), function (e) {
                        return this.getColumnCleanName(e)
                    }, this)
                }, n.prototype.getColumnFriendlyNames = function () {
                    return _.map(this.getColumnNames(), function (e) {
                        return this.getColumnFriendlyName(e)
                    }, this)
                }, n.prototype.getFilters = function () {
                    return this.filters || this.prepareFilters(), this.filters
                }, n.prototype.prepareFilters = function () {
                    var e = [],
                        t = ["filter", "multi-filter", "multiFilter"];
                    _.each(this.getColumns(), function (r) {
                        var n = r.name,
                            i = n.split("::")[1] || n.split("__")[1];
                        if (_.contains(t, i)) {
                            var a = {
                                name: n,
                                friendlyName: this.getColumnFriendlyName(n),
                                column: r,
                                values: [],
                                multiple: "multiFilter" == i || "multi-filter" == i
                            };
                            e.push(a)
                        }
                    }, this), _.each(this.getRawData(), function (t) {
                        _.each(e, function (e) {
                            e.values.push(t[e.name]), 1 == e.values.length && (e.current = t[e.name])
                        })
                    }), _.each(e, function (e) {
                        e.values = _.uniq(e.values)
                    }), this.filters = e
                };
                var u = function (e, r) {
                    a.get({
                        id: e.job.id
                    }, function (n) {
                        e.update(n), "processing" == e.getStatus() && e.job.query_result_id && "None" != e.job.query_result_id ? i.get({
                            id: e.job.query_result_id
                        }, function (t) {
                            e.update(t)
                        }) : "failed" != e.getStatus() && t(function () {
                            u(e, r)
                        }, 3e3)
                    })
                };
                return n.getById = function (e) {
                    var t = new n;
                    return i.get({
                        id: e
                    }, function (e) {
                        t.update(e)
                    }), t
                }, n.prototype.toPromise = function () {
                    return this.deferred.promise
                }, n.get = function (e, t, r, a) {
                    var o = new n,
                        s = {
                            data_source_id: e,
                            query: t,
                            max_age: r
                        };
                    return void 0 !== a && (s.query_id = a), i.post(s, function (e) {
                        o.update(e), "job" in e && u(o, t)
                    }, function (e) {
                        403 === e.status ? o.update(e.data) : 400 === e.status && "job" in e.data && o.update(e.data)
                    }), o
                }, n
            },
            r = function (t, r, n) {
                var i = t("api/queries/:id", {
                    id: "@id"
                }, {
                    search: {
                        method: "get",
                        isArray: !0,
                        url: "api/queries/search"
                    },
                    recent: {
                        method: "get",
                        isArray: !0,
                        url: "api/queries/recent"
                    }
                });
                return i.newQuery = function () {
                    return new i({
                        query: "",
                        name: "New Query",
                        schedule: null,
                        user: currentUser
                    })
                }, i.collectParamsFromQueryString = function (e, t) {
                    var r = t.getParameters(),
                        n = {},
                        i = e.search();
                    return _.each(r, function (e, t) {
                        var r = "p_" + e;
                        r in i && (n[e] = i[r])
                    }), n
                }, i.prototype.getSourceLink = function () {
                    return "/queries/" + this.id + "/source"
                }, i.prototype.isNew = function () {
                    return void 0 === this.id
                }, i.prototype.hasDailySchedule = function () {
                    return this.schedule && null !== this.schedule.match(/\d\d:\d\d/)
                }, i.prototype.scheduleInLocalTime = function () {
                    var e = this.schedule.split(":");
                    return moment.utc().hour(e[0]).minute(e[1]).local().format("HH:mm")
                }, i.prototype.hasResult = function () {
                    return !(!this.latest_query_data && !this.latest_query_data_id)
                }, i.prototype.paramsRequired = function () {
                    var e = this.getParameters();
                    return !_.isEmpty(e)
                }, i.prototype.getQueryResult = function (t, n) {
                    if (this.query) {
                        var i = this.query,
                            a = this.getParameters(),
                            o = !_.isEmpty(a),
                            s = void 0 === n ? a : _.difference(a, _.keys(n));
                        if (o && s.length > 0) {
                            var u = "parameter";
                            return s.length > 1 && (u = "parameters"), new r({
                                job: {
                                    error: "Missing values for " + s.join(", ") + " " + u + ".",
                                    status: 4
                                }
                            })
                        }
                        if (o && (i = Mustache.render(i, n), this.latest_query_data = null, this.latest_query_data_id = null), this.latest_query_data && 0 != t) this.queryResult || (this.queryResult = new r({
                            query_result: this.latest_query_data
                        }));
                        else if (this.latest_query_data_id && 0 != t) this.queryResult || (this.queryResult = r.getById(this.latest_query_data_id));
                        else {
                            if (!this.data_source_id) return new e("Please select data source to run this query.");
                            this.queryResult = r.get(this.data_source_id, i, t, this.id)
                        }
                        return this.queryResult
                    }
                }, i.prototype.getQueryResultPromise = function () {
                    return this.getQueryResult().toPromise()
                }, i.prototype.getParameters = function () {
                    var e = Mustache.parse(this.query),
                        t = [],
                        r = function (e) {
                            return t = [], _.each(e, function (e) {
                                "name" == e[0] || "&" == e[0] ? t.push(e[1]) : "#" == e[0] && (t = _.union(t, r(e[4])))
                            }), t
                        };
                    return t = r(e)
                }, i
            },
            n = function (e) {
                var t = {
                        get: {
                            method: "GET",
                            cache: !1,
                            isArray: !1
                        },
                        query: {
                            method: "GET",
                            cache: !1,
                            isArray: !0
                        },
                        getSchema: {
                            method: "GET",
                            cache: !0,
                            isArray: !0,
                            url: "api/data_sources/:id/schema"
                        }
                    },
                    r = e("api/data_sources/:id", {
                        id: "@id"
                    }, t);
                return r
            },
            i = function (e) {
                var t = {
                        get: {
                            method: "GET",
                            cache: !1,
                            isArray: !1
                        },
                        query: {
                            method: "GET",
                            cache: !1,
                            isArray: !0
                        }
                    },
                    r = e("api/destinations/:id", {
                        id: "@id"
                    }, t);
                return r
            },
            a = function (e, t) {
                var r = function (e) {
                        void 0 !== e.groups && (e.admin = -1 != e.groups.indexOf("admin"))
                    },
                    n = t.defaults.transformResponse.concat(function (e, t) {
                        return _.isArray(e) ? _.each(e, r) : r(e), e
                    }),
                    i = {
                        get: {
                            method: "GET",
                            transformResponse: n
                        },
                        save: {
                            method: "POST",
                            transformResponse: n
                        },
                        query: {
                            method: "GET",
                            isArray: !0,
                            transformResponse: n
                        },
                        "delete": {
                            method: "DELETE",
                            transformResponse: n
                        }
                    },
                    a = e("api/users/:id", {
                        id: "@id"
                    }, i);
                return a
            },
            o = function (e) {
                var t = {
                        get: {
                            method: "GET",
                            cache: !1,
                            isArray: !1
                        },
                        query: {
                            method: "GET",
                            cache: !1,
                            isArray: !0
                        },
                        members: {
                            method: "GET",
                            cache: !1,
                            isArray: !0,
                            url: "api/groups/:id/members"
                        },
                        dataSources: {
                            method: "GET",
                            cache: !1,
                            isArray: !0,
                            url: "api/groups/:id/data_sources"
                        }
                    },
                    r = e("api/groups/:id", {
                        id: "@id"
                    }, t);
                return r
            },
            s = function (e) {
                var t = e("api/alerts/:alertId/subscriptions/:subscriberId", {
                    alertId: "@alert_id",
                    subscriberId: "@id"
                });
                return t
            },
            u = function (e, t) {
                var r = {
                        save: {
                            method: "POST",
                            transformRequest: [function (e) {
                                var t = _.extend({}, e);
                                return void 0 === t.query_id && (t.query_id = t.query.id, t.destination_id = t.destinations, delete t.query, delete t.destinations), t
                            }].concat(t.defaults.transformRequest)
                        }
                    },
                    n = e("api/alerts/:id", {
                        id: "@id"
                    }, r);
                return n
            },
            l = function (e, t) {
                var r = e("api/widgets/:id", {
                    id: "@id"
                });
                return r.prototype.getQuery = function () {
                    return !this.query && this.visualization && (this.query = new t(this.visualization.query)), this.query
                }, r.prototype.getName = function () {
                    return this.visualization ? this.visualization.query.name + " (" + this.visualization.name + ")" : _.str.truncate(this.text, 20)
                }, r
            };
        angular.module("redash.services").factory("QueryResult", ["$resource", "$timeout", "$q", t]).factory("Query", ["$resource", "QueryResult", "DataSource", r]).factory("DataSource", ["$resource", n]).factory("Destination", ["$resource", i]).factory("Alert", ["$resource", "$http", u]).factory("AlertSubscription", ["$resource", s]).factory("Widget", ["$resource", "Query", l]).factory("User", ["$resource", "$http", a]).factory("Group", ["$resource", o])
    }(),
    function () {
        var e = function (e) {
            var t = {
                pageVisible: !0
            };
            return t.monitorVisibility = function () {
                var e, r, n;
                "undefined" != typeof document.hidden ? (e = "hidden", n = "visibilitychange", r = "visibilityState") : "undefined" != typeof document.msHidden && (e = "msHidden", n = "msvisibilitychange", r = "msVisibilityState");
                var i = document[e];
                document.addEventListener(n, function () {
                    i != document[e] && (document[e] ? t.pageVisible = !1 : t.pageVisible = !0, i = document[e])
                })
            }, t.monitorVisibility(), t.isSupported = function () {
                return "Notification" in window ? !0 : (console.log("HTML5 notifications are not supported."), !1)
            }, t.getPermissions = function () {
                this.isSupported() && "default" === Notification.permission && Notification.requestPermission(function (e) {
                    Notification.permission !== e && (Notification.permission = e)
                })
            }, t.showNotification = function (t, r) {
                if (this.isSupported() && !this.pageVisible && "granted" === Notification.permission) {
                    var n = new Notification(t, {
                        tag: t + r,
                        body: r,
                        icon: "/images/redash_icon_small.png"
                    });
                    setTimeout(function () {
                        n.close()
                    }, 3e3), n.onclick = function () {
                        window.focus(), this.close(), e.record(currentUser, "click", "notification")
                    }
                }
            }, t
        };
        angular.module("redash.services").factory("notifications", ["Events", e])
    }(),
    function () {
        var e = function (e, t, r) {
            var n = function (e) {
                    e.widgets = _.map(e.widgets, function (e) {
                        return _.map(e, function (e) {
                            return new r(e)
                        })
                    }), e.publicAccessEnabled = void 0 !== e.public_url
                },
                i = t.defaults.transformResponse.concat(function (e, t) {
                    return _.isArray(e) ? _.each(e, n) : n(e), e
                }),
                a = e("api/dashboards/:slug", {
                    slug: "@slug"
                }, {
                    get: {
                        method: "GET",
                        transformResponse: i
                    },
                    save: {
                        method: "POST",
                        transformResponse: i
                    },
                    query: {
                        method: "GET",
                        isArray: !0,
                        transformResponse: i
                    },
                    recent: {
                        method: "get",
                        isArray: !0,
                        url: "api/dashboards/recent",
                        transformResponse: i
                    }
                });
            return a.prototype.canEdit = function () {
                return currentUser.hasPermission("admin") || currentUser.canEdit(this)
            }, a
        };
        angular.module("redash.services").factory("Dashboard", ["$resource", "$http", "Widget", e])
    }(),
    function () {
        var e = function (e) {
                return e ? e.format(clientConfig.dateTimeFormat) : "-"
            },
            t = function (t, r, n, i, a) {
                t.$parent.pageTitle = "Queries Search", t.gridConfig = {
                    isPaginationEnabled: !0,
                    itemsByPage: 50,
                    maxSize: 8
                }, t.gridColumns = [{
                    label: "Name",
                    map: "name",
                    cellTemplateUrl: "/views/queries_query_name_cell.html"
                }, {
                    label: "Created By",
                    map: "user.name"
                }, {
                    label: "Created At",
                    map: "created_at",
                    formatFunction: e
                }, {
                    label: "Update Schedule",
                    map: "schedule",
                    formatFunction: function (e) {
                        return n("scheduleHumanize")(e)
                    }
                }], t.queries = [], t.$parent.term = r.search().q, a.search({
                    q: t.term
                }, function (e) {
                    t.queries = _.map(e, function (e) {
                        return e.created_at = moment(e.created_at), e
                    })
                }), t.search = function () {
                    return angular.isString(t.term) && "" != t.term.trim() ? void r.search({
                        q: t.term
                    }) : void(t.queries = [])
                }, i.record(currentUser, "search", "query", "", {
                    term: t.term
                })
            },
            r = function (t, r, n, i, a) {
                t.$parent.pageTitle = "All Queries", t.gridConfig = {
                    isPaginationEnabled: !0,
                    itemsByPage: 50,
                    maxSize: 8,
                    isGlobalSearchActivated: !0
                }, t.allQueries = [], t.queries = [];
                var o = function () {
                    t.queries = _.filter(t.allQueries, function (e) {
                        return t.selectedTab ? "my" == t.selectedTab.key ? e.user.id == currentUser.id && "New Query" != e.name : "drafts" == t.selectedTab.key ? e.user.id == currentUser.id && "New Query" == e.name : "New Query" != e.name : !1
                    })
                };
                a.query(function (e) {
                    t.allQueries = _.map(e, function (e) {
                        return e.created_at = moment(e.created_at), e.retrieved_at = moment(e.retrieved_at), e
                    }), o()
                }), t.gridColumns = [{
                    label: "Name",
                    map: "name",
                    cellTemplateUrl: "/views/queries_query_name_cell.html"
                }, {
                    label: "Created By",
                    map: "user.name"
                }, {
                    label: "Created At",
                    map: "created_at",
                    formatFunction: e
                }, {
                    label: "Runtime",
                    map: "run_time",
                    formatFunction: function (e) {
                        return i("durationHumanize")(e)
                    }
                }, {
                    label: "Last Executed At",
                    map: "retrieved_at",
                    formatFunction: e
                }, {
                    label: "Update Schedule",
                    map: "schedule",
                    formatFunction: function (e) {
                        return i("scheduleHumanize")(e)
                    }
                }], t.tabs = [{
                    name: "My Queries",
                    key: "my"
                }, {
                    key: "all",
                    name: "All Queries"
                }, {
                    key: "drafts",
                    name: "Drafts"
                }], t.$watch("selectedTab", function (e) {
                    e && (t.$parent.pageTitle = e.name), o()
                })
            },
            n = function (e, t, r) {
                e.$on("$routeChangeSuccess", function (t, r, n, i) {
                    e.showPermissionError && (e.showPermissionError = !1)
                }), e.$on("$routeChangeError", function (t, r, n, i) {
                    403 === i.status && (e.showPermissionError = !0)
                }), e.location = String(document.location), e.version = clientConfig.version, e.newVersionAvailable = clientConfig.newVersionAvailable && currentUser.hasPermission("admin"), e.newDashboard = {
                    name: null,
                    layout: null
                }
            },
            i = function (e, t, r, n) {
                t.record(currentUser, "view", "page", "personal_homepage"), e.$parent.pageTitle = "Home", e.recentQueries = n.recent(), e.recentDashboards = r.recent()
            };
        angular.module("redash.controllers", []).controller("QueriesCtrl", ["$scope", "$http", "$location", "$filter", "Query", r]).controller("IndexCtrl", ["$scope", "Events", "Dashboard", "Query", i]).controller("MainCtrl", ["$scope", "$location", "Dashboard", n]).controller("QuerySearchCtrl", ["$scope", "$location", "$filter", "Events", "Query", t])
    }(),
    function () {
        var e = function (e, t, r, n, i, a, o, s, u) {
                e.dashboard = seedData.dashboard, e["public"] = !0, e.dashboard.widgets = _.map(e.dashboard.widgets, function (e) {
                    return _.map(e, function (e) {
                        return new r(e)
                    })
                })
            },
            t = function (e, t, r, n, i, a, o, s, u, l) {
                e.refreshEnabled = !1, e.isFullscreen = !1, e.refreshRate = 60;
                var c = function (t) {
                        e.$parent.pageTitle = t.name;
                        var r = [];
                        _.each(e.dashboard.widgets, function (e) {
                            return _.each(e, function (e) {
                                if (e.visualization) {
                                    var t = e.getQuery().getQueryResult();
                                    angular.isDefined(t) && r.push(t.toPromise())
                                }
                            })
                        }), s.all(r).then(function (r) {
                            var n = {};
                            _.each(r, function (r) {
                                var a = r.getFilters();
                                _.each(a, function (r) {
                                    var a = _.has(i.search(), r.name);
                                    if (a || t.dashboard_filters_enabled) {
                                        if (!_.has(n, r.name)) {
                                            var o = _.extend({}, r);
                                            n[o.name] = o, n[o.name].originFilters = [], a && (o.current = i.search()[o.name]), e.$watch(function () {
                                                return o.current
                                            }, function (e) {
                                                _.each(o.originFilters, function (t) {
                                                    t.current = e
                                                })
                                            })
                                        }
                                        n[r.name].originFilters.push(r)
                                    }
                                })
                            }), e.filters = _.values(n)
                        })
                    },
                    d = _.throttle(function () {
                        e.dashboard = l.get({
                            slug: n.dashboardSlug
                        }, function (e) {
                            t.record(currentUser, "view", "dashboard", e.id), c(e)
                        }, function () {
                            d()
                        })
                    }, 1e3);
                d();
                var p = function () {
                    e.refreshEnabled && o(function () {
                        l.get({
                            slug: n.dashboardSlug
                        }, function (t) {
                            var n = _.groupBy(_.flatten(t.widgets), "id");
                            _.each(e.dashboard.widgets, function (e) {
                                _.each(e, function (t, i) {
                                    var a = n[t.id];
                                    a.visualization && a && a[0].visualization.query.latest_query_data_id != t.visualization.query.latest_query_data_id && (e[i] = new r(a[0]))
                                })
                            }), p()
                        })
                    }, e.refreshRate)
                };
                e.archiveDashboard = function () {
                    confirm('Are you sure you want to archive the "' + e.dashboard.name + '" dashboard?') && (t.record(currentUser, "archive", "dashboard", e.dashboard.id), e.dashboard.$delete(function () {
                        e.$parent.reloadDashboards()
                    }))
                }, e.toggleFullscreen = function () {
                    e.isFullscreen = !e.isFullscreen, $("body").toggleClass("headless"), e.isFullscreen ? i.search("fullscreen", !0) : i.search("fullscreen", null)
                }, _.has(i.search(), "fullscreen") && e.toggleFullscreen(), e.triggerRefresh = function () {
                    if (e.refreshEnabled = !e.refreshEnabled, t.record(currentUser, "autorefresh", "dashboard", e.dashboard.id, {
                            enable: e.refreshEnabled
                        }), e.refreshEnabled) {
                        var r = _.min(_.map(_.flatten(e.dashboard.widgets), function (e) {
                            if (e.visualization) {
                                var t = e.visualization.query.schedule;
                                return null === t || null !== t.match(/\d\d:\d\d/) ? 60 : e.visualization.query.schedule
                            }
                        }));
                        e.refreshRate = 1e3 * _.max([120, 2 * r]), p()
                    }
                }, e.openShareForm = function () {
                    u.open({
                        templateUrl: "/views/dashboard_share.html",
                        size: "sm",
                        scope: e,
                        controller: ["$scope", "$modalInstance", "$http", function (e, t, r) {
                            e.close = function () {
                                t.close()
                            }, e.toggleSharing = function () {
                                var t = "api/dashboards/" + e.dashboard.id + "/share";
                                e.dashboard.publicAccessEnabled ? r["delete"](t).success(function () {
                                    e.dashboard.publicAccessEnabled = !1, delete e.dashboard.public_url
                                }).error(function () {
                                    e.dashboard.publicAccessEnabled = !0
                                }) : r.post(t).success(function (t) {
                                    e.dashboard.publicAccessEnabled = !0, e.dashboard.public_url = t.public_url
                                }).error(function () {
                                    e.dashboard.publicAccessEnabled = !1
                                })
                            }
                        }]
                    })
                }
            },
            r = function (e, t, r, n) {
                if (e.deleteWidget = function () {
                        confirm('Are you sure you want to remove "' + e.widget.getName() + '" from the dashboard?') && (r.record(currentUser, "delete", "widget", e.widget.id), e.widget.$delete(function (t) {
                            e.dashboard.widgets = _.map(e.dashboard.widgets, function (e) {
                                return _.filter(e, function (e) {
                                    return void 0 != e.id
                                })
                            }), e.dashboard.widgets = _.filter(e.dashboard.widgets, function (e) {
                                return e.length > 0
                            }), e.dashboard.layout = t.layout
                        }))
                    }, r.record(currentUser, "view", "widget", e.widget.id), e.widget.visualization) {
                    r.record(currentUser, "view", "query", e.widget.visualization.query.id), r.record(currentUser, "view", "visualization", e.widget.visualization.id), e.query = e.widget.getQuery();
                    var i = n.collectParamsFromQueryString(t, e.query),
                        a = t.search().maxAge;
                    e.queryResult = e.query.getQueryResult(a, i), e.type = "visualization"
                } else e.widget.restricted ? e.type = "restricted" : e.type = "textbox"
            };
        angular.module("redash.controllers").controller("DashboardCtrl", ["$scope", "Events", "Widget", "$routeParams", "$location", "$http", "$timeout", "$q", "$modal", "Dashboard", t]).controller("PublicDashboardCtrl", ["$scope", "Events", "Widget", "$routeParams", "$location", "$http", "$timeout", "$q", "Dashboard", e]).controller("WidgetCtrl", ["$scope", "$location", "Events", "Query", r])
    }(),
    function () {
        var e = function (e, t, r, n) {
                t.record(currentUser, "view", "page", "admin/status"), e.$parent.pageTitle = "System Status";
                var i = function () {
                    r.get("/status.json").success(function (t) {
                        e.workers = t.workers, delete t.workers, e.manager = t.manager, delete t.manager, e.status = t
                    });
                    var t = n(i, 59e3);
                    e.$on("$destroy", function () {
                        t && n.cancel(t)
                    })
                };
                i()
            },
            t = function (e) {
                return e ? moment(e).format(clientConfig.dateTimeFormat) : "-"
            },
            r = function (e) {
                return e ? t(1e3 * e) : "-"
            },
            n = function (e, t, n, i, a, o) {
                n.record(currentUser, "view", "page", "admin/tasks"), e.$parent.pageTitle = "Running Queries", e.gridConfig = {
                    isPaginationEnabled: !0,
                    itemsByPage: 50,
                    maxSize: 8
                }, e.selectedTab = "in_progress", e.tasks = {
                    pending: [],
                    in_progress: [],
                    done: []
                }, e.allGridColumns = [{
                    label: "Data Source ID",
                    map: "data_source_id"
                }, {
                    label: "Username",
                    map: "username"
                }, {
                    label: "State",
                    map: "state",
                    cellTemplate: '{{dataRow.state}} <span ng-if="dataRow.state == \'failed\'" popover="{{dataRow.error}}" popover-trigger="mouseenter" class="zmdi zmdi-help"></span>'
                }, {
                    label: "Query ID",
                    map: "query_id"
                }, {
                    label: "Query Hash",
                    map: "query_hash"
                }, {
                    label: "Runtime",
                    map: "run_time",
                    formatFunction: function (e) {
                        return o("durationHumanize")(e)
                    }
                }, {
                    label: "Created At",
                    map: "created_at",
                    formatFunction: r
                }, {
                    label: "Started At",
                    map: "started_at",
                    formatFunction: r
                }, {
                    label: "Updated At",
                    map: "updated_at",
                    formatFunction: r
                }], e.inProgressGridColumns = angular.copy(e.allGridColumns), e.inProgressGridColumns.push({
                    label: "",
                    cellTemplate: '<cancel-query-button query-id="dataRow.query_id" task-id="dataRow.task_id"></cancel-query-button>'
                }), e.setTab = function (t) {
                    e.selectedTab = t, e.showingTasks = e.tasks[t], "in_progress" == t ? e.gridColumns = e.inProgressGridColumns : e.gridColumns = e.allGridColumns
                }, e.setTab(t.hash() || "in_progress");
                var s = function () {
                    e.refresh_time = moment().add("minutes", 1), i.get("/api/admin/queries/tasks").success(function (t) {
                        e.tasks = t, e.showingTasks = e.tasks[e.selectedTab]
                    });
                    var t = a(s, 5e3);
                    e.$on("$destroy", function () {
                        t && a.cancel(t)
                    })
                };
                s()
            },
            i = function (e, r, n, i, a) {
                r.record(currentUser, "view", "page", "admin/outdated_queries"), e.$parent.pageTitle = "Outdated Queries", e.gridConfig = {
                    isPaginationEnabled: !0,
                    itemsByPage: 50,
                    maxSize: 8
                }, e.gridColumns = [{
                    label: "Data Source ID",
                    map: "data_source_id"
                }, {
                    label: "Name",
                    map: "name",
                    cellTemplateUrl: "/views/queries_query_name_cell.html"
                }, {
                    label: "Created By",
                    map: "user.name"
                }, {
                    label: "Runtime",
                    map: "runtime",
                    formatFunction: function (e) {
                        return a("durationHumanize")(e)
                    }
                }, {
                    label: "Last Executed At",
                    map: "retrieved_at",
                    formatFunction: t
                }, {
                    label: "Created At",
                    map: "created_at",
                    formatFunction: t
                }, {
                    label: "Update Schedule",
                    map: "schedule",
                    formatFunction: function (e) {
                        return a("scheduleHumanize")(e)
                    }
                }];
                var o = function () {
                    e.refresh_time = moment().add("minutes", 1), n.get("/api/admin/queries/outdated").success(function (t) {
                        e.queries = t.queries, e.updatedAt = 1e3 * t.updated_at
                    });
                    var t = i(o, 59e3);
                    e.$on("$destroy", function () {
                        t && i.cancel(t)
                    })
                };
                o()
            },
            a = function () {
                return {
                    restrict: "E",
                    scope: {
                        queryId: "=",
                        taskId: "="
                    },
                    transclude: !0,
                    template: '<button class="btn btn-default" ng-disabled="inProgress" ng-click="cancelExecution()"><i class="zmdi zmdi-spinner zmdi-hc-spin" ng-if="inProgress"></i> Cancel</button>',
                    replace: !0,
                    controller: ["$scope", "$http", "Events", function (e, t, r) {
                        e.inProgress = !1, e.cancelExecution = function () {
                            t["delete"]("api/jobs/" + e.taskId).success(function () {});
                            var n = e.queryId;
                            "adhoc" == e.queryId && (n = null), r.record(currentUser, "cancel_execute", "query", n, {
                                admin: !0
                            }), e.inProgress = !0
                        }
                    }]
                }
            };
        angular.module("redash.admin_controllers", []).controller("AdminStatusCtrl", ["$scope", "Events", "$http", "$timeout", e]).controller("AdminTasksCtrl", ["$scope", "$location", "Events", "$http", "$timeout", "$filter", n]).controller("AdminOutdatedQueriesCtrl", ["$scope", "Events", "$http", "$timeout", "$filter", i]).directive("cancelQueryButton", a)
    }(),
    function () {
        var e = function (e, t, r, n, i) {
                n.record(currentUser, "view", "page", "admin/data_sources"), e.$parent.pageTitle = "Data Sources", e.dataSources = i.query()
            },
            t = function (e, t, r, n, i, a, o) {
                a.record(currentUser, "view", "page", "admin/data_source"), e.$parent.pageTitle = "Data Sources", e.dataSourceId = t.dataSourceId, "new" == e.dataSourceId ? e.dataSource = new o({
                    options: {}
                }) : e.dataSource = o.get({
                    id: t.dataSourceId
                }), e.$watch("dataSource.id", function (t) {
                    t != e.dataSourceId && void 0 !== t && n.path("/data_sources/" + t).replace()
                }), e["delete"] = function () {
                    a.record(currentUser, "delete", "datasource", e.dataSource.id), e.dataSource.$delete(function (e) {
                        i.addSuccessMessage("Data source deleted successfully."), n.path("/data_sources/")
                    }.bind(this), function (e) {
                        console.log("Failed to delete data source: ", e.status, e.statusText, e.data), i.addErrorMessage("Failed to delete data source.")
                    })
                }
            };
        angular.module("redash.controllers").controller("DataSourcesCtrl", ["$scope", "$location", "growl", "Events", "DataSource", e]).controller("DataSourceCtrl", ["$scope", "$routeParams", "$http", "$location", "growl", "Events", "DataSource", t])
    }(),
    function () {
        "use strict";

        function e(e, t, r, n, i, a, o, s, u) {
            var l = "table",
                c = function (t) {
                    var r = s.collectParamsFromQueryString(n, e.query);
                    void 0 === t && (t = n.search().maxAge), void 0 === t && (t = -1), e.showLog = !1, e.queryResult = e.query.getQueryResult(t, r)
                },
                d = function () {
                    var t = e.query.data_source_id;
                    void 0 === t && (t = parseInt(localStorage.lastSelectedDataSourceId, 10));
                    var r = !isNaN(t) && _.some(e.dataSources, function (e) {
                        return e.id == t
                    });
                    return r || (t = e.dataSources[0].id), t
                },
                p = function (t) {
                    return e.dataSources = _.filter(t, function (t) {
                        return !t.view_only || t.id === e.query.data_source_id
                    }), 0 == e.dataSources.length ? void(e.noDataSources = !0) : (e.query.isNew() && (e.query.data_source_id = d()), e.dataSource = _.find(t, function (t) {
                        return t.id == e.query.data_source_id
                    }), e.canCreateQuery = _.any(t, function (e) {
                        return !e.view_only
                    }), void f())
                };
            e.dataSource = {}, e.query = r.current.locals.query;
            var f = function () {
                e.hasSchema = !1, e.editorSize = "col-md-12", u.getSchema({
                    id: e.query.data_source_id
                }, function (t) {
                    t && t.length > 0 ? (e.schema = t, _.each(t, function (e) {
                        e.collapsed = !0
                    }), e.editorSize = "col-md-9", e.hasSchema = !0) : (e.hasSchema = !1, e.editorSize = "col-md-12")
                })
            };
            t.record(currentUser, "view", "query", e.query.id), (e.query.hasResult() || e.query.paramsRequired()) && c(), e.queryExecuting = !1, e.isQueryOwner = currentUser.id === e.query.user.id || currentUser.hasPermission("admin"), e.canViewSource = currentUser.hasPermission("view_source"), e.canExecuteQuery = function () {
                return currentUser.hasPermission("execute_query") && !e.dataSource.view_only
            }, e.canScheduleQuery = currentUser.hasPermission("schedule_query"), r.current.locals.dataSources ? (e.dataSources = r.current.locals.dataSources, p(r.current.locals.dataSources)) : e.dataSources = u.query(p), e.showDataset = !0, e.showLog = !1, e.lockButton = function (t) {
                e.queryExecuting = t
            }, e.showApiKey = function () {
                alert("API Key for this query:\n" + e.query.api_key)
            }, e.saveQuery = function (t, r) {
                return r ? r.id = e.query.id : r = _.clone(e.query), t = _.extend({}, {
                    successMessage: "Query saved",
                    errorMessage: "Query could not be saved"
                }, t), delete r.latest_query_data, delete r.queryResult, s.save(r, function () {
                    a.addSuccessMessage(t.successMessage)
                }, function (e) {
                    a.addErrorMessage(t.errorMessage)
                }).$promise
            }, e.saveDescription = function () {
                t.record(currentUser, "edit_description", "query", e.query.id), e.saveQuery(void 0, {
                    description: e.query.description
                })
            }, e.saveName = function () {
                t.record(currentUser, "edit_name", "query", e.query.id), e.saveQuery(void 0, {
                    name: e.query.name
                })
            }, e.executeQuery = function () {
                e.canExecuteQuery() && e.query.query && (c(0), e.lockButton(!0), e.cancelling = !1, t.record(currentUser, "execute", "query", e.query.id), i.getPermissions())
            }, e.cancelExecution = function () {
                e.cancelling = !0, e.queryResult.cancelExecution(), t.record(currentUser, "cancel_execute", "query", e.query.id)
            }, e.archiveQuery = function (t, r) {
                return r ? r.id = e.query.id : r = e.query, e.isDirty = !1, t = _.extend({}, {
                    successMessage: "Query archived",
                    errorMessage: "Query could not be archived"
                }, t), s["delete"]({
                    id: r.id
                }, function () {
                    e.query.is_archived = !0, e.query.schedule = null, a.addSuccessMessage(t.successMessage), $("#archive-confirmation-modal").modal("hide")
                }, function (e) {
                    a.addErrorMessage(t.errorMessage)
                }).$promise
            }, e.updateDataSource = function () {
                t.record(currentUser, "update_data_source", "query", e.query.id), localStorage.lastSelectedDataSourceId = e.query.data_source_id, e.query.latest_query_data = null, e.query.latest_query_data_id = null, e.query.id && s.save({
                    id: e.query.id,
                    data_source_id: e.query.data_source_id,
                    latest_query_data_id: null
                }), f(), e.dataSource = _.find(e.dataSources, function (t) {
                    return t.id == e.query.data_source_id
                }), e.executeQuery()
            }, e.setVisualizationTab = function (t) {
                e.selectedTab = t.id, n.hash(t.id)
            }, e.$watch("query.name", function () {
                e.$parent.pageTitle = e.query.name
            }), e.$watch("queryResult && queryResult.getData()", function (t, r) {
                t && (e.filters = e.queryResult.getFilters())
            }), e.$watch("queryResult && queryResult.getStatus()", function (t) {
                t && ("done" == t ? (e.query.latest_query_data_id = e.queryResult.getId(), e.query.queryResult = e.queryResult, i.showNotification("Re:dash", e.query.name + " updated.")) : "failed" == t && i.showNotification("Re:dash", e.query.name + " failed to run: " + e.queryResult.getError()), "done" !== t && "failed" !== t || e.lockButton(!1), null != e.queryResult.getLog() && (e.showLog = !0))
            }), e.openVisualizationEditor = function (t) {
                function r() {
                    o.open({
                        templateUrl: "/views/directives/visualization_editor.html",
                        windowClass: "modal-xl",
                        scope: e,
                        controller: ["$scope", "$modalInstance", function (e, r) {
                            e.modalInstance = r, e.visualization = t, e.close = function () {
                                r.close()
                            }
                        }]
                    })
                }
                e.query.isNew() ? e.saveQuery().then(function (e) {
                    n.path(e.getSourceLink()).hash("add")
                }) : r()
            }, "add" === n.hash() && (n.hash(null), e.openVisualizationEditor()), e.openScheduleForm = function () {
                e.isQueryOwner && e.canScheduleQuery && o.open({
                    templateUrl: "/views/schedule_form.html",
                    size: "sm",
                    scope: e,
                    controller: ["$scope", "$modalInstance", function (e, t) {
                        e.close = function () {
                            t.close()
                        }, e.query.hasDailySchedule() ? e.refreshType = "daily" : e.refreshType = "periodic"
                    }]
                })
            }, e.showEmbedDialog = function (e, t) {
                o.open({
                    templateUrl: "/views/dialogs/embed_code.html",
                    controller: ["$scope", "$modalInstance", function (r, n) {
                        r.close = function () {
                            n.close()
                        }, r.embedUrl = basePath + "embedjon/query/" + e.id + "/visualization/" + t.id + "?api_key=" + e.api_key
                    }]
                })
            }, e.$watch(function () {
                return n.hash()
            }, function (r) {
                "pivot" == r && t.record(currentUser, "pivot", "query", e.query && e.query.id), e.selectedTab = r || l
            })
        }
        angular.module("redash.controllers").controller("QueryViewCtrl", ["$scope", "Events", "$route", "$location", "notifications", "growl", "$modal", "Query", "DataSource", e])
    }(),
    function () {
        "use strict";

        function e(e, t, r, n, i, a, o, s) {
            r("QueryViewCtrl", {
                $scope: n
            });
            var u = "table";
            e.record(currentUser, "view_source", "query", n.query.id);
            var l = !n.query.id,
                c = n.query.query,
                d = n.saveQuery;
            n.sourceMode = !0, n.canEdit = currentUser.canEdit(n.query), n.isDirty = !1, n.base_url = i.protocol() + "://" + i.host() + ":" + i.port(), n.newVisualization = void 0, Object.defineProperty(n, "showDataset", {
                get: function () {
                    return n.queryResult && "done" == n.queryResult.getStatus()
                }
            });
            var p = {
                "meta+s": function () {
                    n.canEdit && n.saveQuery()
                },
                "ctrl+s": function () {
                    n.canEdit && n.saveQuery()
                },
                "meta+enter": n.executeQuery,
                "ctrl+enter": n.executeQuery
            };
            s.bind(p), n.saveQuery = function (e, t) {
                var r = d(e, t);
                return r.then(function (e) {
                    c = e.query, n.isDirty = n.query.query !== c, l && i.path(e.getSourceLink())
                }), r
            }, n.duplicateQuery = function () {
                e.record(currentUser, "fork", "query", n.query.id), n.query.name = "Copy of (#" + n.query.id + ") " + n.query.name, n.query.id = null, n.query.schedule = null, n.saveQuery({
                    successMessage: "Query forked",
                    errorMessage: "Query could not be forked"
                }).then(function (e) {
                    i.url(e.getSourceLink()).replace()
                })
            }, n.deleteVisualization = function (r, a) {
                r.preventDefault(), confirm("Are you sure you want to delete " + a.name + " ?") && (e.record(currentUser, "delete", "visualization", a.id), o["delete"](a, function () {
                    n.selectedTab == a.id && (n.selectedTab = u, i.hash(n.selectedTab)), n.query.visualizations = n.query.visualizations.filter(function (e) {
                        return a.id !== e.id
                    })
                }, function () {
                    t.addErrorMessage("Error deleting visualization. Maybe it's used in a dashboard?")
                }))
            }, n.$watch("query.query", function (e) {
                n.isDirty = e !== c
            }), n.$on("$destroy", function () {
                s.unbind(p)
            })
        }
        angular.module("redash.controllers").controller("QuerySourceCtrl", ["Events", "growl", "$controller", "$scope", "$location", "Query", "Visualization", "KeyboardShortcuts", e])
    }(),
    function () {
        var e = function (e, t, r, n, i, a) {
                i.record(currentUser, "view", "page", "groups"), e.$parent.pageTitle = "Groups", e.gridConfig = {
                    isPaginationEnabled: !0,
                    itemsByPage: 20,
                    maxSize: 8
                }, e.gridColumns = [{
                    label: "Name",
                    map: "name",
                    cellTemplate: '<a href="groups/{{dataRow.id}}">{{dataRow.name}}</a>'
                }], e.groups = [], a.query(function (t) {
                    e.groups = t
                }), e.newGroup = function () {
                    r.open({
                        templateUrl: "/views/groups/edit_group_form.html",
                        size: "sm",
                        resolve: {
                            group: function () {
                                return new a({})
                            }
                        },
                        controller: ["$scope", "$modalInstance", "group", function (e, r, n) {
                            e.group = n;
                            var i = void 0 === n.id;
                            i ? (e.saveButtonText = "Create", e.title = "Create a New Group") : (e.saveButtonText = "Save", e.title = "Edit Group"), e.ok = function () {
                                e.group.$save(function (e) {
                                    i ? (t.path("/groups/" + e.id).replace(), r.close()) : r.close()
                                })
                            }, e.cancel = function () {
                                r.close()
                            }
                        }]
                    })
                }
            },
            t = function (e, t) {
                return {
                    restrict: "E",
                    scope: {
                        group: "="
                    },
                    transclude: !0,
                    template: '<h2><edit-in-place editable="canEdit()" done="saveName" ignore-blanks=\'true\' value="group.name"></edit-in-place>&nbsp;<button class="btn btn-xs btn-danger" ng-if="canEdit()" ng-click="deleteGroup()">Delete this group</button></h2>',
                    replace: !0,
                    controller: ["$scope", function (r) {
                        r.canEdit = function () {
                            return currentUser.isAdmin && "builtin" != r.group.type
                        }, r.saveName = function () {
                            r.group.$save()
                        }, r.deleteGroup = function () {
                            confirm("Are you sure you want to delete this group?") && r.group.$delete(function () {
                                e.path("/groups").replace(), t.addSuccessMessage("Group deleted successfully.")
                            })
                        }
                    }]
                }
            },
            r = function (e, t, r, n, i, a, o, s) {
                a.record(currentUser, "view", "group_data_sources", e.groupId), e.group = o.get({
                    id: t.groupId
                }), e.dataSources = o.dataSources({
                    id: t.groupId
                }), e.newDataSource = {}, e.findDataSource = function (t) {
                    void 0 === e.foundDataSources && s.query(function (t) {
                        var r = _.map(e.dataSources, function (e) {
                            return e.id
                        });
                        e.foundDataSources = _.filter(t, function (e) {
                            return !_.contains(r, e.id)
                        })
                    })
                }, e.addDataSource = function (n) {
                    e.newDataSource.selected = void 0, r.post("api/groups/" + t.groupId + "/data_sources", {
                        data_source_id: n.id
                    }).success(function (t) {
                        n.view_only = !1, e.dataSources.unshift(n), e.foundDataSources && (e.foundDataSources = _.filter(e.foundDataSources, function (e) {
                            return e != n
                        }))
                    })
                }, e.changePermission = function (e, n) {
                    r.post("api/groups/" + t.groupId + "/data_sources/" + e.id, {
                        view_only: n
                    }).success(function () {
                        e.view_only = n
                    })
                }, e.removeDataSource = function (n) {
                    r["delete"]("api/groups/" + t.groupId + "/data_sources/" + n.id).success(function () {
                        e.dataSources = _.filter(e.dataSources, function (e) {
                            return n != e
                        })
                    })
                }
            },
            n = function (e, t, r, n, i, a, o, s) {
                a.record(currentUser, "view", "group", e.groupId), e.group = o.get({
                    id: t.groupId
                }), e.members = o.members({
                    id: t.groupId
                }), e.newMember = {}, e.findUser = function (t) {
                    "" != t && void 0 === e.foundUsers && s.query(function (t) {
                        var r = _.map(e.members, function (e) {
                            return e.id
                        });
                        _.each(t, function (e) {
                            e.alreadyMember = _.contains(r, e.id)
                        }), e.foundUsers = t
                    })
                }, e.addMember = function (n) {
                    e.newMember.selected = void 0, r.post("api/groups/" + t.groupId + "/members", {
                        user_id: n.id
                    }).success(function () {
                        e.members.unshift(n), n.alreadyMember = !0
                    })
                }, e.removeMember = function (n) {
                    r["delete"]("api/groups/" + t.groupId + "/members/" + n.id).success(function () {
                        e.members = _.filter(e.members, function (e) {
                            return e != n
                        }), e.foundUsers && _.each(e.foundUsers, function (e) {
                            e.id == n.id && (e.alreadyMember = !1)
                        })
                    })
                }
            },
            i = function (e, t, r, n, i) {
                n.record(currentUser, "view", "page", "users"), e.$parent.pageTitle = "Users", e.gridConfig = {
                    isPaginationEnabled: !0,
                    itemsByPage: 20,
                    maxSize: 8
                }, e.gridColumns = [{
                    label: "Name",
                    map: "name",
                    cellTemplate: '<img ng-src="{{dataRow.gravatar_url}}" height="40px"/> <a href="users/{{dataRow.id}}">{{dataRow.name}}</a>'
                }, {
                    label: "Joined",
                    cellTemplate: '<span am-time-ago="dataRow.created_at"></span>'
                }], e.users = [], i.query(function (t) {
                    e.users = t
                })
            },
            a = function (e, t, r, n, i, a, o) {
                e.$parent.pageTitle = "Users", e.userId = t.userId, "me" === e.userId && (e.userId = currentUser.id), a.record(currentUser, "view", "user", e.userId), e.canEdit = currentUser.hasPermission("admin") || currentUser.id === parseInt(e.userId), e.showSettings = !1, e.showPasswordSettings = !1, e.selectTab = function (t) {
                    e.selectedTab = t, _.each(e.tabs, function (r, n) {
                        e.tabs[n] = n === t
                    })
                }, e.setTab = function (t) {
                    e.selectedTab = t, n.hash(t)
                }, e.tabs = {
                    profile: !1,
                    apiKey: !1,
                    settings: !1,
                    password: !1
                }, e.selectTab(n.hash() || "profile"), e.user = o.get({
                    id: e.userId
                }, function (t) {
                    "password" == t.auth_type && (e.showSettings = e.canEdit, e.showPasswordSettings = e.canEdit)
                }), e.password = {
                    current: "",
                    "new": "",
                    newRepeat: ""
                }, e.savePassword = function (t) {
                    if (e.$broadcast("show-errors-check-validity"), t.$valid) {
                        var r = {
                            id: e.user.id,
                            password: e.password["new"],
                            old_password: e.password.current
                        };
                        o.save(r, function () {
                            i.addSuccessMessage("Password Saved."), e.password = {
                                current: "",
                                "new": "",
                                newRepeat: ""
                            }
                        }, function (e) {
                            var t = e.data.message || "Failed saving password.";
                            i.addErrorMessage(t)
                        })
                    }
                }, e.updateUser = function (t) {
                    if (e.$broadcast("show-errors-check-validity"), t.$valid) {
                        var r = {
                            id: e.user.id,
                            name: e.user.name,
                            email: e.user.email
                        };
                        o.save(r, function (t) {
                            i.addSuccessMessage("Saved."), e.user = t
                        }, function (e) {
                            var t = e.data.message || "Failed saving.";
                            i.addErrorMessage(t)
                        })
                    }
                }, e.sendPasswordReset = function () {
                    e.disablePasswordResetButton = !0, r.post("api/users/" + e.user.id + "/reset_password").success(function (t) {
                        e.disablePasswordResetButton = !1, i.addSuccessMessage("The user should receive a link to reset his password by email soon.")
                    })
                }
            },
            o = function (e, t, r, n, i) {
                n.record(currentUser, "view", "page", "users/new")
            },
            s = function (e, t) {
                return {
                    restrict: "E",
                    scope: {},
                    templateUrl: "/views/users/new_user_form.html",
                    replace: !0,
                    link: function (r) {
                        r.user = new t({}), r.saveUser = function () {
                            r.$broadcast("show-errors-check-validity"), r.userForm.$valid && r.user.$save(function (t) {
                                r.user = t, r.user.created = !0, e.addSuccessMessage("Saved.")
                            }, function (t) {
                                var r = t.data.message || "Failed saving.";
                                e.addErrorMessage(r)
                            })
                        }
                    }
                }
            };
        angular.module("redash.controllers").controller("GroupsCtrl", ["$scope", "$location", "$modal", "growl", "Events", "Group", e]).directive("groupName", ["$location", "growl", t]).directive("newUserForm", ["growl", "User", s]).controller("GroupCtrl", ["$scope", "$routeParams", "$http", "$location", "growl", "Events", "Group", "User", n]).controller("GroupDataSourcesCtrl", ["$scope", "$routeParams", "$http", "$location", "growl", "Events", "Group", "DataSource", r]).controller("UsersCtrl", ["$scope", "$location", "growl", "Events", "User", i]).controller("UserCtrl", ["$scope", "$routeParams", "$http", "$location", "growl", "Events", "User", a]).controller("NewUserCtrl", ["$scope", "$location", "growl", "Events", "User", o])
    }(),
    function () {
        var e = function () {
                this.visualizations = {}, this.visualizationTypes = {};
                var e = {
                    defaultOptions: {},
                    skipTypes: !1,
                    editorTemplate: null
                };
                this.registerVisualization = function (t) {
                    var r = _.extend({}, e, t);
                    _.isEmpty(this.visualizations) && (this.defaultVisualization = r), this.visualizations[t.type] = r, t.skipTypes || (this.visualizationTypes[t.name] = t.type)
                }, this.getSwitchTemplate = function (e) {
                    var t = /(<[a-zA-Z0-9-]*?)( |>)/,
                        r = _.reduce(this.visualizations, function (r, n) {
                            if (n[e]) {
                                var i = '$1 ng-switch-when="' + n.type + '" $2',
                                    a = n[e].replace(t, i);
                                return r + "\n" + a
                            }
                            return r
                        }, "");
                    return r = '<div ng-switch on="visualization.type">' + r + "</div>"
                }, this.$get = ["$resource", function (e) {
                    var t = e("api/visualizations/:id", {
                        id: "@id"
                    });
                    return t.visualizations = this.visualizations, t.visualizationTypes = this.visualizationTypes, t.renderVisualizationsTemplate = this.getSwitchTemplate("renderTemplate"), t.editorTemplate = this.getSwitchTemplate("editorTemplate"), t.defaultVisualization = this.defaultVisualization, t
                }]
            },
            t = function (e) {
                return {
                    restrict: "E",
                    scope: {
                        visualization: "="
                    },
                    template: "{{name}}",
                    replace: !1,
                    link: function (t) {
                        e.visualizations[t.visualization.type].name !== t.visualization.name && (t.name = t.visualization.name)
                    }
                }
            },
            r = function (e, t) {
                return {
                    restrict: "E",
                    scope: {
                        visualization: "=",
                        queryResult: "="
                    },
                    template: "<filters></filters>\n" + t.renderVisualizationsTemplate,
                    replace: !1,
                    link: function (e) {
                        e.$watch("queryResult && queryResult.getFilters()", function (t) {
                            t && (e.filters = t)
                        })
                    }
                }
            },
            n = function (e) {
                return {
                    restrict: "E",
                    template: e.editorTemplate,
                    replace: !1
                }
            },
            i = function () {
                return {
                    restrict: "E",
                    templateUrl: "/views/visualizations/filters.html"
                }
            },
            a = function () {
                return function (e, t) {
                    if (_.isArray(e) && (e = e[0]), "date" === t.column.type) {
                        if (e && moment.isMoment(e)) return e.format(clientConfig.dateFormat)
                    } else if ("datetime" === t.column.type && e && moment.isMoment(e)) return e.format(clientConfig.dateTimeFormat);
                    return e
                }
            },
            o = function (e, t, r) {
                return {
                    restrict: "E",
                    templateUrl: "/views/visualizations/edit_visualization.html",
                    replace: !0,
                    scope: {
                        query: "=",
                        queryResult: "=",
                        originalVisualization: "=?",
                        onNewSuccess: "=?",
                        modalInstance: "=?"
                    },
                    link: function (n) {
                        if (n.visualization = angular.copy(n.originalVisualization), n.editRawOptions = currentUser.hasPermission("edit_raw_chart"), n.visTypes = t.visualizationTypes, n.newVisualization = function () {
                                return {
                                    type: t.defaultVisualization.type,
                                    name: t.defaultVisualization.name,
                                    description: "",
                                    options: t.defaultVisualization.defaultOptions
                                }
                            }, !n.visualization) var i = n.$watch("query.id", function (e) {
                            e && (i(), n.visualization = n.newVisualization())
                        });
                        n.$watch("visualization.type", function (e, r) {
                            e && r !== e && n.visualization && !n.visForm.name.$dirty && (n.visualization.name = _.string.titleize(n.visualization.type)), e && r !== e && n.visualization && (n.visualization.options = t.visualizations[n.visualization.type].defaultOptions)
                        }), n.submit = function () {
                            n.visualization.id ? e.record(currentUser, "update", "visualization", n.visualization.id, {
                                type: n.visualization.type
                            }) : e.record(currentUser, "create", "visualization", null, {
                                type: n.visualization.type
                            }), n.visualization.query_id = n.query.id, t.save(n.visualization, function (e) {
                                r.addSuccessMessage("Visualization saved");
                                var t = _.pluck(n.query.visualizations, "id"),
                                    i = t.indexOf(e.id);
                                i > -1 ? n.query.visualizations[i] = e : (n.query.visualizations.push(e), n.onNewSuccess && n.onNewSuccess(e)), n.modalInstance.close()
                            }, function () {
                                r.addErrorMessage("Visualization could not be saved")
                            })
                        }, n.close = function () {
                            n.visForm.$dirty ? confirm("Are you sure you want to close the editor without saving?") && n.modalInstance.close() : n.modalInstance.close()
                        }
                    }
                }
            };
        angular.module("redash.visualization", []).provider("Visualization", e).directive("visualizationRenderer", ["$location", "Visualization", r]).directive("visualizationOptionsEditor", ["Visualization", n]).directive("visualizationName", ["Visualization", t]).directive("filters", i).filter("filterValue", a).directive("editVisulatizationForm", ["Events", "Visualization", "growl", o])
    }(),
    function () {
        var e = angular.module("redash.visualization");
        e.config(["VisualizationProvider", function (e) {
            var t = '<chart-renderer options="visualization.options" query-result="queryResult"></chart-renderer>',
                r = '<chart-editor options="visualization.options" query-result="queryResult"></chart-editor>',
                n = {
                    globalSeriesType: "column",
                    sortX: !0,
                    legend: {
                        enabled: !0
                    },
                    yAxis: [{
                        type: "linear"
                    }, {
                        type: "linear",
                        opposite: !0
                    }],
                    xAxis: {
                        type: "datetime",
                        labels: {
                            enabled: !0
                        }
                    },
                    series: {
                        stacking: null
                    },
                    seriesOptions: {},
                    columnMapping: {},
                    bottomMargin: 50
                };
            e.registerVisualization({
                type: "CHART",
                name: "Chart",
                renderTemplate: t,
                editorTemplate: r,
                defaultOptions: n
            })
        }]), e.directive("chartRenderer", function () {
            return {
                restrict: "E",
                scope: {
                    queryResult: "=",
                    options: "=?"
                },
                templateUrl: "/views/visualizations/chart.html",
                replace: !1,
                controller: ["$scope", function (e) {
                    e.chartSeries = [];
                    var t = function () {
                            r(), e.plotlyOptions = e.options
                        },
                        r = function () {
                            angular.isDefined(e.queryResult) && (e.chartSeries = _.sortBy(e.queryResult.getChartData(e.options.columnMapping), function (t) {
                                return e.options.seriesOptions[t.name] ? e.options.seriesOptions[t.name].zIndex : 0
                            }))
                        };
                    e.$watch("options", t, !0), e.$watch("queryResult && queryResult.getData()", r)
                }]
            }
        }), e.directive("chartEditor", ["ColorPalette", function (e) {
            return {
                restrict: "E",
                templateUrl: "/views/visualizations/chart_editor.html",
                scope: {
                    queryResult: "=",
                    options: "=?"
                },
                link: function (t, r, n) {
                    t.currentTab = "general", t.colors = _.extend({
                        Automatic: null
                    }, e), t.stackingOptions = {
                        Disabled: null,
                        Enabled: "normal",
                        Percent: "percent"
                    }, t.chartTypes = {
                        line: {
                            name: "Line",
                            icon: "line-chart"
                        },
                        column: {
                            name: "Bar",
                            icon: "bar-chart"
                        },
                        area: {
                            name: "Area",
                            icon: "area-chart"
                        },
                        pie: {
                            name: "Pie",
                            icon: "pie-chart"
                        },
                        scatter: {
                            name: "Scatter",
                            icon: "circle-o"
                        }
                    }, t.chartTypeChanged = function () {
                        _.each(t.options.seriesOptions, function (e) {
                            e.type = t.options.globalSeriesType
                        })
                    }, t.xAxisScales = ["datetime", "linear", "logarithmic", "category"], t.yAxisScales = ["linear", "logarithmic", "datetime"];
                    var i = function () {
                        t.columns = t.queryResult.getColumns(), t.columnNames = _.pluck(t.columns, "name"), t.columnNames.length > 0 && _.each(_.difference(_.keys(t.options.columnMapping), t.columnNames), function (e) {
                            delete t.options.columnMapping[e]
                        })
                    };
                    i();
                    var a = function () {
                            i(), t.queryResult.getData() && 0 != t.queryResult.getData().length && 0 != t.columns.length && (t.form.yAxisColumns = _.intersection(t.form.yAxisColumns, t.columnNames), _.contains(t.columnNames, t.form.xAxisColumn) || (t.form.xAxisColumn = void 0), _.contains(t.columnNames, t.form.groupby) || (t.form.groupby = void 0))
                        },
                        o = function () {
                            var e = _.pluck(t.queryResult.getChartData(t.options.columnMapping), "name"),
                                r = _.keys(t.options.seriesOptions);
                            _.each(_.difference(e, r), function (e) {
                                t.options.seriesOptions[e] = {
                                    type: t.options.globalSeriesType,
                                    yAxis: 0
                                }, t.form.seriesList.push(e)
                            }), _.each(_.difference(r, e), function (e) {
                                t.form.seriesList = _.without(t.form.seriesList, e), delete t.options.seriesOptions[e]
                            })
                        };
                    t.$watch("options.columnMapping", function () {
                        "done" === t.queryResult.status && o()
                    }, !0), t.$watch(function () {
                        return [t.queryResult.getId(), t.queryResult.status]
                    }, function (e) {
                        e[0] && "done" === e[1] && (a(), o())
                    }, !0), t.form = {
                        yAxisColumns: [],
                        seriesList: _.sortBy(_.keys(t.options.seriesOptions), function (e) {
                            return t.options.seriesOptions[e].zIndex
                        })
                    }, t.$watchCollection("form.seriesList", function (e, r) {
                        _.each(e, function (e, r) {
                            t.options.seriesOptions[e].zIndex = r, t.options.seriesOptions[e].index = 0
                        })
                    });
                    var s = function (e, r) {
                            t.options.columnMapping[r] = e
                        },
                        u = function (e) {
                            s("unused", e)
                        };
                    t.$watchCollection("form.yAxisColumns", function (e, t) {
                        _.each(t, u), _.each(e, _.partial(s, "y"))
                    }), t.$watch("form.xAxisColumn", function (e, t) {
                        void 0 !== t && u(t), void 0 !== e && s("x", e)
                    }), t.$watch("form.groupby", function (e, t) {
                        void 0 !== t && u(t), void 0 !== e && s("series", e)
                    }), _.has(t.options, "legend") || (t.options.legend = {
                        enabled: !0
                    }), _.has(t.options, "bottomMargin") || (t.options.bottomMargin = 50), t.columnNames && _.each(t.options.columnMapping, function (e, r) {
                        t.columnNames.length > 0 && !_.contains(t.columnNames, r) || ("x" == e ? t.form.xAxisColumn = r : "y" == e ? t.form.yAxisColumns.push(r) : "series" == e && (t.form.groupby = r))
                    })
                }
            }
        }])
    }(),
    function () {
        var e = angular.module("redash.visualization");
        e.config(["VisualizationProvider", function (e) {
            var t = "<cohort-editor></cohort-editor>",
                r = {
                    timeInterval: "daily"
                };
            e.registerVisualization({
                type: "COHORT",
                name: "Cohort",
                renderTemplate: '<cohort-renderer options="visualization.options" query-result="queryResult"></cohort-renderer>',
                editorTemplate: t,
                defaultOptions: r
            })
        }]), e.directive("cohortRenderer", function () {
            return {
                restrict: "E",
                scope: {
                    queryResult: "=",
                    options: "="
                },
                template: "",
                replace: !1,
                link: function (e, t, r) {
                    e.options.timeInterval = e.options.timeInterval || "daily";
                    var n = function () {
                        if (null !== e.queryResult.getData()) {
                            var r = _.sortBy(e.queryResult.getData(), function (e) {
                                    return e.date + e.day_number
                                }),
                                n = _.groupBy(r, "date"),
                                i = _.reduce(n, function (e, t) {
                                    return t.length > e ? t.length : e
                                }, 0),
                                a = _.map(n, function (e, t) {
                                    var r = [e[0].total];
                                    return _.each(e, function (e) {
                                        r.push(e.value)
                                    }), _.each(_.range(e.length, i), function () {
                                        r.push(null)
                                    }), r
                                }),
                                o = moment(r[0].date).toDate(),
                                s = angular.element(t)[0];
                            Cornelius.draw({
                                initialDate: o,
                                container: s,
                                cohort: a,
                                title: null,
                                timeInterval: e.options.timeInterval,
                                labels: {
                                    time: "Time",
                                    people: "Users",
                                    weekOf: "Week of"
                                }
                            })
                        }
                    };
                    e.$watch("queryResult && queryResult.getData()", n), e.$watch("options.timeInterval", n)
                }
            }
        }), e.directive("cohortEditor", function () {
            return {
                restrict: "E",
                templateUrl: "/views/visualizations/cohort_editor.html"
            }
        })
    }(),
    function () {
        var e = angular.module("redash.visualization");
        e.config(["VisualizationProvider", function (e) {
            var t = '<map-renderer options="visualization.options" query-result="queryResult"></map-renderer>',
                r = "<map-editor></map-editor>",
                n = {
                    height: 500,
                    draw: "Marker",
                    classify: "none"
                };
            e.registerVisualization({
                type: "MAP",
                name: "Map",
                renderTemplate: t,
                editorTemplate: r,
                defaultOptions: n
            })
        }]), e.directive("mapRenderer", function () {
            return {
                restrict: "E",
                templateUrl: "/views/visualizations/map.html",
                link: function (e, t, r) {
                    var n = function () {
                        var t = e.visualization.options.bounds;
                        if (t) e.map.fitBounds([[t._southWest.lat, t._southWest.lng], [t._northEast.lat, t._northEast.lng]]);
                        else if (e.features.length > 0) {
                            var r = new L.featureGroup(e.features);
                            e.map.fitBounds(r.getBounds())
                        }
                    };
                    e.$watch("[queryResult && queryResult.getData(), visualization.options.draw,visualization.options.latColName,visualization.options.lonColName,visualization.options.classify,visualization.options.classify]", function () {
                        function r(t) {
                            e.visualization.options.bounds = e.map.getBounds()
                        }
                        var i = function (e, t) {
                                return null != e && null != t ? L.marker([e, t]) : void 0
                            },
                            a = function (t, r, n) {
                                if (null != t && null != r) {
                                    var i = "red";
                                    if (n && n[e.visualization.options.classify] && e.visualization.options.classification) {
                                        var a = $.grep(e.visualization.options.classification, function (t) {
                                            return t.value == n[e.visualization.options.classify]
                                        });
                                        a.length > 0 && (i = a[0].color)
                                    }
                                    var o = {
                                        fillColor: i,
                                        fillOpacity: .5,
                                        stroke: !1
                                    };
                                    return L.circleMarker([t, r], o)
                                }
                            },
                            o = function (e) {
                                var t, r, n = Math.floor(120 * (100 - e) / 100),
                                    i = Math.abs(e - 50) / 50,
                                    a = 1,
                                    o = [];
                                if (0 === i) t = [a, a, a];
                                else switch (n /= 60, r = Math.floor(n), o = [a * (1 - i), a * (1 - i * (n - r)), a * (1 - i * (1 - (n - r)))], r) {
                                    case 0:
                                        t = [a, o[2], o[0]];
                                        break;
                                    case 1:
                                        t = [o[1], a, o[0]];
                                        break;
                                    case 2:
                                        t = [o[0], a, o[2]];
                                        break;
                                    case 3:
                                        t = [o[0], o[1], a];
                                        break;
                                    case 4:
                                        t = [o[2], o[0], a];
                                        break;
                                    default:
                                        t = [a, o[0], o[1]]
                                }
                                return "#" + t.map(function (e) {
                                    return ("0" + Math.round(255 * e).toString(16)).slice(-2)
                                }).join("")
                            };
                        L.Icon.Default.imagePath = L.Icon.Default.imagePath || "//api.tiles.mapbox.com/mapbox.js/v2.2.1/images";
                        var s = e.queryResult.getData(),
                            u = e.visualization.options.classify;
                        if (s) {
                            e.visualization.options.classification = [];
                            for (var l in s) s[l][u] && 0 == $.grep(e.visualization.options.classification, function (e) {
                                return e.value == s[l][u]
                            }).length && e.visualization.options.classification.push({
                                value: s[l][u],
                                color: null
                            });
                            $.each(e.visualization.options.classification, function (t, r) {
                                r.color = o(parseInt(t / e.visualization.options.classification.length * 100))
                            }), e.map || (e.map = L.map(t[0].children[0].children[0])), L.tileLayer("//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            }).addTo(e.map), e.features = e.features || [];
                            var c = [],
                                d = e.visualization.options.latColName || "lat",
                                p = e.visualization.options.lonColName || "lon";
                            for (var l in s) {
                                var f;
                                if ("Marker" == e.visualization.options.draw ? f = i(s[l][d], s[l][p]) : "Color" == e.visualization.options.draw && (f = a(s[l][d], s[l][p], s[l])), f) {
                                    var m = '<ul style="list-style-type: none;padding-left: 0">';
                                    for (var h in s[l]) m += "<li>" + h + ": " + s[l][h] + "</li>";
                                    m += "</ul>", f.bindPopup(m), c.push(f)
                                }
                            }
                            $.each(e.features, function (t, r) {
                                e.map.removeLayer(r)
                            }), e.features = c, $.each(e.features, function (t, r) {
                                r.addTo(e.map)
                            }), n(), e.map.on("focus", function () {
                                e.map.on("moveend", r)
                            }), e.map.on("blur", function () {
                                e.map.off("moveend", r)
                            }), $('a[href="#' + e.visualization.id + '"]').length > 0 && $('a[href="#' + e.visualization.id + '"]').on("click", function () {
                                setTimeout(function () {
                                    e.map.invalidateSize(!1), n()
                                }, 500)
                            })
                        }
                    }, !0), e.$watch("visualization.options.height", function () {
                        e.map && (e.map.invalidateSize(!1), n())
                    })
                }
            }
        }), e.directive("mapEditor", function () {
            return {
                restrict: "E",
                templateUrl: "/views/visualizations/map_editor.html",
                link: function (e, t, r) {
                    e.draw_options = ["Marker", "Color"], e.classify_columns = e.queryResult.columnNames.concat("none")
                }
            }
        })
    }(),
    function () {
        var e = angular.module("redash.visualization");
        e.config(["VisualizationProvider", function (e) {
            var t = '<counter-renderer options="visualization.options" query-result="queryResult"></counter-renderer>',
                r = "<counter-editor></counter-editor>",
                n = {
                    counterColName: "counter",
                    rowNumber: 1,
                    targetRowNumber: 1
                };
            e.registerVisualization({
                type: "COUNTER",
                name: "Counter",
                renderTemplate: t,
                editorTemplate: r,
                defaultOptions: n
            })
        }]), e.directive("counterRenderer", function () {
            return {
                restrict: "E",
                templateUrl: "/views/visualizations/counter.html",
                link: function (e, t, r) {
                    var n = function () {
                        var t = e.queryResult.getData();
                        if (t) {
                            var r = e.visualization.options.rowNumber - 1,
                                n = e.visualization.options.targetRowNumber - 1,
                                i = e.visualization.options.counterColName,
                                a = e.visualization.options.targetColName;
                            i && (e.counterValue = t[r][i]), a ? (e.targetValue = t[n][a], e.targetValue && (e.delta = e.counterValue - e.targetValue, e.trendPositive = e.delta >= 0)) : e.targetValue = null
                        }
                    };
                    e.$watch("visualization.options", n, !0), e.$watch("queryResult && queryResult.getData()", n)
                }
            }
        }), e.directive("counterEditor", function () {
            return {
                restrict: "E",
                templateUrl: "/views/visualizations/counter_editor.html"
            }
        })
    }(),
    function () {
        var e = angular.module("redash.visualization");
        e.config(["VisualizationProvider", function (e) {
            var t = '<boxplot-renderer options="visualization.options" query-result="queryResult"></boxplot-renderer>',
                r = "<boxplot-editor></boxplot-editor>";
            e.registerVisualization({
                type: "BOXPLOT",
                name: "Boxplot",
                renderTemplate: t,
                editorTemplate: r
            })
        }]), e.directive("boxplotRenderer", function () {
            return {
                restrict: "E",
                templateUrl: "/views/visualizations/boxplot.html",
                link: function (e, t, r) {
                    function n(e) {
                        return function (t, r) {
                            for (var n = t.quartiles[0], i = t.quartiles[2], a = (i - n) * e, r = -1, o = t.length; t[++r] < n - a;);
                            for (; t[--o] > i + a;);
                            return [r, o]
                        }
                    }
                    e.$watch("[queryResult && queryResult.getData(), visualization.options]", function () {
                        var r = e.queryResult.getData(),
                            i = d3.select(t[0].parentNode).node().getBoundingClientRect().width,
                            a = {
                                top: 10,
                                right: 50,
                                bottom: 40,
                                left: 50,
                                inner: 25
                            },
                            o = i - a.right - a.left;
                        height = 500 - a.top - a.bottom;
                        var s = 1 / 0,
                            u = -(1 / 0),
                            l = [],
                            c = 0,
                            d = [],
                            p = e.visualization.options.xAxisLabel,
                            f = e.visualization.options.yAxisLabel,
                            m = e.queryResult.columnNames,
                            h = d3.scale.ordinal().domain(m).rangeBands([0, i - a.left - a.right]);
                        m.length > 1 ? boxWidth = Math.min(h(m[1]), 120) : boxWidth = 120, a.inner = boxWidth / 3, _.each(m, function (e, t) {
                            d = l[t] = [], _.each(r, function (t) {
                                c = t[e], d.push(c), c > u && (u = Math.ceil(c)), s > c && (s = Math.floor(c))
                            })
                        });
                        var g = d3.scale.linear().domain([.99 * s, 1.01 * u]).range([height, 0]),
                            y = d3.box().whiskers(n(1.5)).width(boxWidth - 2 * a.inner).height(height).domain([.99 * s, 1.01 * u]),
                            v = d3.svg.axis().scale(h).orient("bottom"),
                            b = d3.svg.axis().scale(g).orient("left"),
                            w = d3.svg.axis().scale(h).tickSize(height).orient("bottom"),
                            q = d3.svg.axis().scale(g).tickSize(o).orient("right"),
                            $ = function (e) {
                                return h(m[e]) + (h(m[1]) - a.inner) / 2
                            };
                        d3.select(t[0]).selectAll("svg").remove();
                        var z = d3.select(t[0]).append("svg").attr("width", i).attr("height", height + a.bottom + a.top).append("g").attr("width", i - a.left - a.right).attr("transform", "translate(" + a.left + "," + a.top + ")");
                        d3.select("svg").append("text").attr("class", "box").attr("x", i / 2).attr("text-anchor", "middle").attr("y", height + a.bottom).text(p), d3.select("svg").append("text").attr("class", "box").attr("transform", "translate(10," + (height + a.top + a.bottom) / 2 + ")rotate(-90)").attr("text-anchor", "middle").text(f), z.append("rect").attr("class", "grid-background").attr("width", o).attr("height", height), z.append("g").attr("class", "grid").call(q), z.append("g").attr("class", "grid").call(w), z.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(v), z.append("g").attr("class", "y axis").call(b), z.selectAll(".box").data(l).enter().append("g").attr("class", "box").attr("width", boxWidth).attr("height", height).attr("transform", function (e, t) {
                            return "translate(" + $(t) + ",0)"
                        }).call(y)
                    }, !0)
                }
            }
        }), e.directive("boxplotEditor", function () {
            return {
                restrict: "E",
                templateUrl: "/views/visualizations/boxplot_editor.html"
            }
        })
    }(),
    function () {
        function e(e) {
            return [0, e.length - 1]
        }

        function t(e) {
            return [d3.quantile(e, .25), d3.quantile(e, .5), d3.quantile(e, .75)]
        }
        d3.box = function () {
            function r(e) {
                e.each(function (e, t) {
                    e = e.map(s).sort(d3.ascending);
                    var r = d3.select(this),
                        d = e.length,
                        p = e[0],
                        f = e[d - 1],
                        m = e.quartiles = l(e),
                        h = u && u.call(this, e, t),
                        g = h && h.map(function (t) {
                            return e[t]
                        }),
                        y = h ? d3.range(0, h[0]).concat(d3.range(h[1] + 1, d)) : d3.range(d),
                        v = d3.scale.linear().domain(o && o.call(this, e, t) || [p, f]).range([i, 0]),
                        b = this.__chart__ || d3.scale.linear().domain([0, 1 / 0]).range(v.range());
                    this.__chart__ = v;
                    var _ = r.selectAll("line.center").data(g ? [g] : []);
                    _.enter().insert("line", "rect").attr("class", "center").attr("x1", n / 2).attr("y1", function (e) {
                        return b(e[0])
                    }).attr("x2", n / 2).attr("y2", function (e) {
                        return b(e[1])
                    }).style("opacity", 1e-6).transition().duration(a).style("opacity", 1).attr("y1", function (e) {
                        return v(e[0])
                    }).attr("y2", function (e) {
                        return v(e[1])
                    }), _.transition().duration(a).style("opacity", 1).attr("y1", function (e) {
                        return v(e[0])
                    }).attr("y2", function (e) {
                        return v(e[1])
                    }), _.exit().transition().duration(a).style("opacity", 1e-6).attr("y1", function (e) {
                        return v(e[0])
                    }).attr("y2", function (e) {
                        return v(e[1])
                    }).remove();
                    var w = r.selectAll("rect.box").data([m]);
                    w.enter().append("rect").attr("class", "box").attr("x", 0).attr("y", function (e) {
                        return b(e[2])
                    }).attr("width", n).attr("height", function (e) {
                        return b(e[0]) - b(e[2])
                    }).transition().duration(a).attr("y", function (e) {
                        return v(e[2])
                    }).attr("height", function (e) {
                        return v(e[0]) - v(e[2])
                    }), w.transition().duration(a).attr("y", function (e) {
                        return v(e[2])
                    }).attr("height", function (e) {
                        return v(e[0]) - v(e[2])
                    }), w.exit().remove();
                    var q = r.selectAll("line.median").data([m[1]]);
                    q.enter().append("line").attr("class", "median").attr("x1", 0).attr("y1", b).attr("x2", n).attr("y2", b).transition().duration(a).attr("y1", v).attr("y2", v), q.transition().duration(a).attr("y1", v).attr("y2", v), q.exit().remove();
                    var $ = r.selectAll("line.whisker").data(g || []);
                    $.enter().insert("line", "circle, text").attr("class", "whisker").attr("x1", 0).attr("y1", b).attr("x2", n).attr("y2", b).style("opacity", 1e-6).transition().duration(a).attr("y1", v).attr("y2", v).style("opacity", 1), $.transition().duration(a).attr("y1", v).attr("y2", v).style("opacity", 1), $.exit().transition().duration(a).attr("y1", v).attr("y2", v).style("opacity", 1e-6).remove();
                    var z = r.selectAll("circle.outlier").data(y, Number);
                    z.enter().insert("circle", "text").attr("class", "outlier").attr("r", 5).attr("cx", n / 2).attr("cy", function (t) {
                        return b(e[t])
                    }).style("opacity", 1e-6).transition().duration(a).attr("cy", function (t) {
                        return v(e[t])
                    }).style("opacity", 1), z.transition().duration(a).attr("cy", function (t) {
                        return v(e[t])
                    }).style("opacity", 1), z.exit().transition().duration(a).attr("cy", function (t) {
                        return v(e[t])
                    }).style("opacity", 1e-6).remove();
                    var S = c || v.tickFormat(8),
                        x = r.selectAll("text.box").data(m);
                    x.enter().append("text").attr("class", "box").attr("dy", ".3em").attr("dx", function (e, t) {
                        return 1 & t ? 6 : -6
                    }).attr("x", function (e, t) {
                        return 1 & t ? n : 0
                    }).attr("y", b).attr("text-anchor", function (e, t) {
                        return 1 & t ? "start" : "end"
                    }).text(S).transition().duration(a).attr("y", v), x.transition().duration(a).text(S).attr("y", v), x.exit().remove();
                    var T = r.selectAll("text.whisker").data(g || []);
                    T.enter().append("text").attr("class", "whisker").attr("dy", ".3em").attr("dx", 6).attr("x", n).attr("y", b).text(S).style("opacity", 1e-6).transition().duration(a).attr("y", v).style("opacity", 1), T.transition().duration(a).text(S).attr("y", v).style("opacity", 1), T.exit().transition().duration(a).attr("y", v).style("opacity", 1e-6).remove()
                }), d3.timer.flush()
            }
            var n = 1,
                i = 1,
                a = 0,
                o = null,
                s = Number,
                u = e,
                l = t,
                c = null;
            return r.width = function (e) {
                return arguments.length ? (n = e, r) : n
            }, r.height = function (e) {
                return arguments.length ? (i = e, r) : i
            }, r.tickFormat = function (e) {
                return arguments.length ? (c = e, r) : c
            }, r.duration = function (e) {
                return arguments.length ? (a = e, r) : a
            }, r.domain = function (e) {
                return arguments.length ? (o = null == e ? e : d3.functor(e), r) : o
            }, r.value = function (e) {
                return arguments.length ? (s = e, r) : s
            }, r.whiskers = function (e) {
                return arguments.length ? (u = e, r) : u
            }, r.quartiles = function (e) {
                return arguments.length ? (l = e, r) : l
            }, r
        }
    }(),
    function () {
        var e = angular.module("redash.visualization");
        e.config(["VisualizationProvider", function (e) {
            e.registerVisualization({
                type: "TABLE",
                name: "Table",
                renderTemplate: '<grid-renderer options="visualization.options" query-result="queryResult"></grid-renderer>',
                skipTypes: !0
            })
        }]), e.directive("gridRenderer", function () {
            return {
                restrict: "E",
                scope: {
                    queryResult: "=",
                    itemsPerPage: "="
                },
                templateUrl: "/views/grid_renderer.html",
                replace: !1,
                controller: ["$scope", "$filter", function (e, t) {
                    e.gridColumns = [], e.gridData = [], e.gridConfig = {
                        isPaginationEnabled: !0,
                        itemsByPage: e.itemsPerPage || 15,
                        maxSize: 8
                    }, e.$watch("queryResult && queryResult.getData()", function (r) {
                        if (r)
                            if (null == e.queryResult.getData()) e.gridColumns = [], e.gridData = [], e.filters = [];
                            else {
                                e.filters = e.queryResult.getFilters();
                                var n = function (t) {
                                    var r = _.map(t, function (t) {
                                        var r = {};
                                        return _.each(t, function (t, n) {
                                            r[e.queryResult.getColumnCleanName(n)] = t
                                        }), r
                                    });
                                    return r
                                };
                                e.gridData = n(e.queryResult.getData());
                                var i = e.queryResult.getColumns();
                                e.gridColumns = _.map(e.queryResult.getColumnCleanNames(), function (r, n) {
                                    var a = {
                                            label: e.queryResult.getColumnFriendlyNames()[n],
                                            map: r
                                        },
                                        o = i[n].type;
                                    return "integer" === o ? (a.formatFunction = "number", a.formatParameter = 0) : "float" === o ? (a.formatFunction = "number", a.formatParameter = 2) : "boolean" === o ? a.formatFunction = function (e) {
                                        return void 0 !== e ? "" + e : e
                                    } : "date" === o ? a.formatFunction = function (e) {
                                        return e && moment.isMoment(e) ? e.format(clientConfig.dateFormat) : e
                                    } : "datetime" === o ? a.formatFunction = function (e) {
                                        return e && moment.isMoment(e) ? e.format(clientConfig.dateTimeFormat) : e
                                    } : a.formatFunction = function (e) {
                                        return angular.isString(e) && (e = t("linkify")(e)), e
                                    }, a
                                })
                            }
                    })
                }]
            }
        })
    }(),
    function () {
        var e = angular.module("redash.visualization");
        e.directive("pivotTableRenderer", function () {
            return {
                restrict: "E",
                scope: {
                    queryResult: "=",
                    visualization: "="
                },
                template: "",
                replace: !1,
                link: function (e, t) {
                    e.$watch("queryResult && queryResult.getData()", function (r) {
                        if (r)
                            if (null === e.queryResult.getData());
                            else {
                                r = $.extend(!0, [], e.queryResult.getRawData());
                                var n = {
                                    renderers: $.pivotUtilities.renderers,
                                    onRefresh: function (t) {
                                        var r = $.extend(!0, {}, t);
                                        delete r.aggregators, delete r.renderers, delete r.rendererOptions, delete r.localeStrings, e.visualization && (e.visualization.options = r)
                                    }
                                };
                                e.visualization && $.extend(n, e.visualization.options), $(t).pivotUI(r, n, !0)
                            }
                    })
                }
            }
        }), e.config(["VisualizationProvider", function (e) {
            var t = "<div/>",
                r = {};
            e.registerVisualization({
                type: "PIVOT",
                name: "Pivot Table",
                renderTemplate: '<pivot-table-renderer visualization="visualization" query-result="queryResult"></pivot-table-renderer>',
                editorTemplate: t,
                defaultOptions: r
            })
        }])
    }(),
    function (e) {
        var t = angular.module("redash.visualization");
        t.directive("dateRangeSelector", [function () {
            return {
                restrict: "E",
                scope: {
                    dateRange: "="
                },
                templateUrl: "/views/visualizations/date_range_selector.html",
                replace: !0,
                controller: ["$scope", function (e) {
                    e.dateRangeHuman = {
                        min: null,
                        max: null
                    }, e.$watch("dateRange", function (e, t, r) {
                        r.dateRangeHuman.min = e.min.format("YYYY-MM-DD"), r.dateRangeHuman.max = e.max.format("YYYY-MM-DD")
                    }), e.$watch("dateRangeHuman", function (e, t, r) {
                        var n = moment.utc(e.min),
                            i = moment.utc(e.max);
                        return n && i && n.isValid() && i.isValid() && !n.isAfter(i) ? (r.dateRange.min = n, void(r.dateRange.max = i)) : void(r.dateRangeHuman = t)
                    }, !0)
                }]
            }
        }])
    }(window),
    function () {
        "use strict";
        var e = angular.module("redash.directives", []);
        e.directive("appHeader", ["$location", "Dashboard", "notifications", function (e, t) {
            return {
                restrict: "E",
                replace: !0,
                templateUrl: "/views/app_header.html",
                link: function (r) {
                    r.dashboards = [], r.logoUrl = clientConfig.logoUrl, r.reloadDashboards = function () {
                        t.query(function (e) {
                            r.dashboards = _.sortBy(e, "name"), r.allDashboards = _.groupBy(r.dashboards, function (e) {
                                var t = e.name.split(":");
                                return 1 == t.length ? "Other" : t[0]
                            }), r.otherDashboards = r.allDashboards.Other || [], r.groupedDashboards = _.omit(r.allDashboards, "Other")
                        })
                    }, r.searchQueries = function () {
                        e.path("/queries/search").search({
                            q: r.term
                        })
                    }, r.reloadDashboards(), r.currentUser = currentUser
                }
            }
        }]), e.directive("alertUnsavedChanges", ["$window", function (e) {
            return {
                restrict: "E",
                replace: !0,
                scope: {
                    isDirty: "="
                },
                link: function (t) {
                    var r = "You will lose your changes if you leave",
                        n = r + "\n\nAre you sure you want to leave this page?",
                        i = e.onbeforeunload;
                    e.onbeforeunload = function () {
                        return t.isDirty ? r : null
                    }, t.$on("$locationChangeStart", function (e, r, i) {
                        r.split("#")[0] != i.split("#")[0] && t.isDirty && !confirm(n) && e.preventDefault()
                    }), t.$on("$destroy", function () {
                        e.onbeforeunload = i
                    })
                }
            }
        }]), e.directive("hashLink", ["$location", function (e) {
            return {
                restrict: "A",
                scope: {
                    hash: "@"
                },
                link: function (t, r) {
                    var n = e.path().substring(1);
                    r[0].href = n + "#" + t.hash
                }
            }
        }]), e.directive("rdTab", ["$location", function (e) {
            return {
                restrict: "E",
                scope: {
                    tabId: "@",
                    name: "@"
                },
                transclude: !0,
                template: '<li class="rd-tab" ng-class="{active: tabId==selectedTab}"><a href="{{basePath}}#{{tabId}}">{{name}}<span ng-transclude></span></a></li>',
                replace: !0,
                link: function (t) {
                    t.basePath = e.path().substring(1), t.$watch(function () {
                        return t.$parent.selectedTab
                    }, function (e) {
                        t.selectedTab = e
                    })
                }
            }
        }]), e.directive("emailSettingsWarning", function () {
            return {
                restrict: "E",
                template: '<p class="alert alert-danger" ng-if="showMailWarning">It looks like your mail server isn\'t configured. Make sure to configure it for the {{function}} to work.</p>',
                link: function (e, t, r) {
                    e.showMailWarning = clientConfig.mailSettingsMissing && currentUser.isAdmin, e["function"] = r["function"]
                }
            }
        }), e.directive("rdTabs", ["$location", function (e) {
            return {
                restrict: "E",
                scope: {
                    tabsCollection: "=",
                    selectedTab: "="
                },
                template: '<ul class="tab-nav bg-white"><li ng-class="{active: tab==selectedTab}" ng-repeat="tab in tabsCollection"><a href="{{basePath}}#{{tab.key}}">{{tab.name}}</a></li></ul>',
                replace: !0,
                link: function (t, r, n) {
                    t.basePath = e.path().substring(1), t.selectTab = function (e) {
                        t.selectedTab = _.find(t.tabsCollection, function (t) {
                            return t.key == e
                        })
                    }, t.$watch(function () {
                        return e.hash()
                    }, function (r) {
                        r ? t.selectTab(e.hash()) : t.selectTab(t.tabsCollection[0].key)
                    })
                }
            }
        }]), e.directive("editInPlace", function () {
            return {
                restrict: "E",
                scope: {
                    value: "=",
                    ignoreBlanks: "=",
                    editable: "=",
                    done: "="
                },
                template: function (e, t) {
                    var r = t.editor || "input",
                        n = t.placeholder || "Click to edit",
                        i = "";
                    i = "true" == t.markdown ? '<span ng-click="editable && edit()" ng-bind-html="value|markdown" ng-class="{editable: editable}"></span>' : '<span ng-click="editable && edit()" ng-bind="value" ng-class="{editable: editable}"></span>';
                    var a = '<span ng-click="editable && edit()" ng-show="editable && !value" ng-class="{editable: editable}">' + n + "</span>",
                        o = '<{elType} ng-model="value" class="rd-form-control"></{elType}>'.replace("{elType}", r);
                    return i + a + o
                },
                link: function (e, t, r) {
                    function n() {
                        e.editing && (e.ignoreBlanks && _.isEmpty(e.value) && (e.value = e.oldValue), e.editing = !1, t.removeClass("active"), e.value !== e.oldValue && e.done && e.done())
                    }
                    var i = angular.element(t.children()[2]);
                    t.addClass("edit-in-place"), e.editing = !1, e.edit = function () {
                        e.oldValue = e.value, e.editing = !0, t.addClass("active"), i[0].focus()
                    }, $(i).keydown(function (t) {
                        13 !== t.which || t.shiftKey ? 27 === t.which && (e.value = e.oldValue, e.$apply(function () {
                            $(i[0]).blur()
                        })) : n()
                    }).blur(function () {
                        n()
                    })
                }
            }
        }), e.directive("jsonText", function () {
            return {
                restrict: "A",
                require: "ngModel",
                link: function (e, t, r, n) {
                    function i(e) {
                        return JSON.parse(e)
                    }

                    function a(e) {
                        return JSON.stringify(e, void 0, 2)
                    }
                    n.$parsers.push(i), n.$formatters.push(a), e.$watch(r.ngModel, function (e) {
                        t[0].value = a(e)
                    }, !0)
                }
            }
        }), e.directive("rdTimer", [function () {
            return {
                restrict: "E",
                scope: {
                    timestamp: "="
                },
                template: "{{currentTime}}",
                controller: ["$scope", function (e) {
                    e.currentTime = "00:00:00";
                    var t = setInterval(function () {
                        e.currentTime = moment(moment() - moment(e.timestamp)).utc().format("HH:mm:ss"), e.$digest()
                    }, 1e3);
                    e.$on("$destroy", function () {
                        t && (clearInterval(t), t = null)
                    })
                }]
            }
        }]), e.directive("rdTimeAgo", function () {
            return {
                restrict: "E",
                scope: {
                    value: "="
                },
                template: '<span><span ng-show="value" am-time-ago="value"></span><span ng-hide="value">-</span></span>'
            }
        }), e.directive("autofocus", ["$timeout", function (e) {
            return {
                link: function (t, r) {
                    e(function () {
                        r[0].focus()
                    })
                }
            }
        }]), e.directive("compareTo", function () {
            return {
                require: "ngModel",
                scope: {
                    otherModelValue: "=compareTo"
                },
                link: function (e, t, r, n) {
                    var i = function (t) {
                        n.$setValidity("compareTo", t === e.otherModelValue)
                    };
                    e.$watch("otherModelValue", function () {
                        i(n.$modelValue)
                    }), n.$parsers.push(function (e) {
                        return i(e), e
                    })
                }
            }
        }), e.directive("inputErrors", function () {
            return {
                restrict: "E",
                templateUrl: "/views/directives/input_errors.html",
                replace: !0,
                scope: {
                    errors: "="
                }
            }
        }), e.directive("onDestroy", function () {
            return {
                restrict: "A",
                scope: {
                    onDestroy: "&"
                },
                link: function (e, t, r) {
                    e.$on("$destroy", function () {
                        e.onDestroy()
                    })
                }
            }
        }), e.directive("colorBox", function () {
            return {
                restrict: "E",
                scope: {
                    color: "="
                },
                template: "<span style='width: 12px; height: 12px; background-color: {{color}}; display: inline-block; margin-right: 5px;'></span>"
            }
        }), e.directive("overlay", function () {
            return {
                restrict: "E",
                transclude: !0,
                template: '<div><div class="overlay"></div><div style="width: 100%; position:absolute; top:50px; z-index:2000"><div class="well well-lg" style="width: 70%; margin: auto;" ng-transclude></div></div></div>'
            }
        }), e.directive("dynamicForm", ["$http", "growl", "$q", function (e, t, r) {
            return {
                restrict: "E",
                replace: "true",
                transclude: !0,
                templateUrl: "/views/directives/dynamic_form.html",
                scope: {
                    target: "=",
                    type: "@type"
                },
                link: function (n) {
                    var i = function (e) {
                        return void 0 === n.target.type ? (n.target.type = e[0].type, e[0]) : void(n.type = _.find(e, function (e) {
                            return e.type == n.target.type
                        }))
                    };
                    n.files = {}, n.$watchCollection("files", function () {
                        _.each(n.files, function (e, t) {
                            e && (n.target.options[t] = e.base64)
                        })
                    });
                    var a = e.get("api/" + n.type + "/types");
                    r.all([a, n.target.$promise]).then(function (e) {
                        var t = e[0].data;
                        i(t), n.types = t, _.each(t, function (e) {
                            _.each(e.configuration_schema.properties, function (t, r) {
                                "password" != r && "passwd" != r || (t.type = "password"), _.string.endsWith(r, "File") && (t.type = "file"), "boolean" == t.type && (t.type = "checkbox"), t.required = _.contains(e.configuration_schema.required, r)
                            })
                        })
                    }), n.$watch("target.type", function (e, t) {
                        t !== e && (void 0 !== t && (n.target.options = {}), i(n.types))
                    }), n.saveChanges = function () {
                        n.target.$save(function () {
                            t.addSuccessMessage("Saved.")
                        }, function () {
                            t.addErrorMessage("Failed saving.")
                        })
                    }
                }
            }
        }]), e.directive("pageHeader", function () {
            return {
                restrict: "E",
                transclude: !0,
                templateUrl: "/views/directives/page_header.html",
                link: function (e, t, r) {
                    r.$observe("title", function (t) {
                        e.title = t
                    })
                }
            }
        }), e.directive("settingsScreen", ["$location", function (e) {
            return {
                restrict: "E",
                transclude: !0,
                templateUrl: "/views/directives/settings_screen.html",
                link: function (t, r, n) {
                    t.usersPage = _.string.startsWith(e.path(), "/users"), t.groupsPage = _.string.startsWith(e.path(), "/groups"), t.dsPage = _.string.startsWith(e.path(), "/data_sources"), t.destinationsPage = _.string.startsWith(e.path(), "/destinations"), t.showGroupsLink = currentUser.hasPermission("list_users"), t.showUsersLink = currentUser.hasPermission("list_users"), t.showDsLink = currentUser.hasPermission("admin"), t.showDestinationsLink = currentUser.hasPermission("admin")
                }
            }
        }])
    }(),
    function () {
        "use strict";

        function e() {
            return {
                restrict: "E",
                scope: {
                    query: "=",
                    visualization: "=?"
                },
                template: '<a ng-href="{{link}}" class="query-link">{{query.name}}</a>',
                link: function (e, t) {
                    e.link = "queries/" + e.query.id, e.visualization && ("TABLE" === e.visualization.type ? e.link += "#table" : e.link += "#" + e.visualization.id)
                }
            }
        }

        function t() {
            return {
                restrict: "E",
                template: '<span ng-show="query.id && canViewSource">                    <a ng-show="!sourceMode"                      ng-href="queries/{{query.id}}/source#{{selectedTab}}" class="btn btn-default">Show Source                    </a>                    <a ng-show="sourceMode"                      ng-href="queries/{{query.id}}#{{selectedTab}}" class="btn btn-default">Hide Source                    </a>                </span>'
            }
        }

        function r() {
            return {
                restrict: "A",
                link: function (e, t, r) {
                    var n = r.fileType ? r.fileType : "csv";
                    e.$watch("queryResult && queryResult.getData()", function (r) {
                        r && (null == e.queryResult.getId() ? t.attr("href", "") : (t.attr("href", "api/queries/" + e.query.id + "/results/" + e.queryResult.getId() + "." + n), t.attr("download", e.query.name.replace(" ", "_") + moment(e.queryResult.getUpdatedAt()).format("_YYYY_MM_DD") + "." + n)))
                    })
                }
            }
        }

        function n() {
            return {
                restrict: "E",
                scope: {
                    query: "=",
                    lock: "=",
                    schema: "=",
                    syntax: "="
                },
                template: "<textarea></textarea>",
                link: {
                    pre: function (e, t) {
                        e.syntax = e.syntax || "sql";
                        var r = {
                                sql: "text/x-sql",
                                python: "text/x-python",
                                json: "application/json"
                            },
                            n = t.children()[0],
                            i = {
                                mode: r[e.syntax],
                                lineWrapping: !0,
                                lineNumbers: !0,
                                readOnly: !1,
                                matchBrackets: !0,
                                autoCloseBrackets: !0,
                                extraKeys: {
                                    "Ctrl-Space": "autocomplete"
                                }
                            },
                            a = [];
                        CodeMirror.commands.autocomplete = function (e) {
                            var t = function (e, t) {
                                var r = CodeMirror.hint.anyword(e, t),
                                    n = e.getCursor(),
                                    i = e.getTokenAt(n).string;
                                return r.list = _.union(r.list, _.filter(a, function (e) {
                                    return 0 === e.search(i)
                                })), r
                            };
                            CodeMirror.showHint(e, t)
                        };
                        var o = CodeMirror.fromTextArea(n, i);
                        o.on("change", function (t) {
                            var r = t.getValue();
                            r !== e.query.query && e.$evalAsync(function () {
                                e.query.query = r
                            })
                        }), e.$watch("query.query", function () {
                            e.query.query !== o.getValue() && o.setValue(e.query.query)
                        }), e.$watch("schema", function (e) {
                            if (e) {
                                var t = [];
                                _.each(e, function (e) {
                                    t.push(e.name), _.each(e.columns, function (e) {
                                        t.push(e)
                                    })
                                }), a = _.unique(t)
                            }
                            o.refresh()
                        }), e.$watch("syntax", function (e) {
                            o.setOption("mode", r[e])
                        }), e.$watch("lock", function (e) {
                            var t = e ? "nocursor" : !1;
                            o.setOption("readOnly", t)
                        })
                    }
                }
            }
        }

        function i(e) {
            return {
                restrict: "E",
                scope: !1,
                template: '<button type="button" class="btn btn-default btn-s"                   ng-click="formatQuery()">                    <span class="zmdi zmdi-format-indent-increase"></span>                     Format SQL                </button>',
                link: function (t) {
                    t.formatQuery = function () {
                        t.queryFormatting = !0, e.post("api/queries/format", {
                            query: t.query.query
                        }).success(function (e) {
                            t.query.query = e
                        })["finally"](function () {
                            t.queryFormatting = !1
                        })
                    }
                }
            }
        }

        function a() {
            return {
                restrict: "E",
                template: '<select ng-disabled="refreshType != \'daily\'" ng-model="hour" ng-change="updateSchedule()" ng-options="c as c for c in hourOptions"></select> :                 <select ng-disabled="refreshType != \'daily\'" ng-model="minute" ng-change="updateSchedule()" ng-options="c as c for c in minuteOptions"></select>',
                link: function (e) {
                    var t = function (e, t) {
                        return t = String(t), t.length < e && (t = "0" + t), t
                    };
                    if (e.hourOptions = _.map(_.range(0, 24), _.partial(t, 2)), e.minuteOptions = _.map(_.range(0, 60, 5), _.partial(t, 2)), e.query.hasDailySchedule()) {
                        var r = e.query.scheduleInLocalTime().split(":");
                        e.minute = r[1], e.hour = r[0]
                    } else e.minute = "15", e.hour = "00";
                    e.updateSchedule = function () {
                        var t = moment().hour(e.hour).minute(e.minute).utc().format("HH:mm");
                        t != e.query.schedule && (e.query.schedule = t, e.saveQuery())
                    }, e.$watch("refreshType", function () {
                        "daily" == e.refreshType && e.updateSchedule()
                    })
                }
            }
        }

        function o() {
            return {
                restrict: "E",
                template: '<select                  ng-disabled="refreshType != \'periodic\'"                  ng-model="query.schedule"                  ng-change="saveQuery()"                  ng-options="c.value as c.name for c in refreshOptions">                  <option value="">No Refresh</option>                  </select>',
                link: function (e) {
                    e.refreshOptions = [{
                        value: "60",
                        name: "Every minute"
                    }], _.each([5, 10, 15, 30], function (t) {
                        e.refreshOptions.push({
                            value: String(60 * t),
                            name: "Every " + t + " minutes"
                        })
                    }), _.each(_.range(1, 13), function (t) {
                        e.refreshOptions.push({
                            value: String(3600 * t),
                            name: "Every " + t + "h"
                        })
                    }), e.refreshOptions.push({
                        value: String(86400),
                        name: "Every 24h"
                    }), e.refreshOptions.push({
                        value: String(604800),
                        name: "Once a week"
                    }), e.refreshOptions.push({
                        value: String(2592e3),
                        name: "Every 30d"
                    }), e.$watch("refreshType", function () {
                        "periodic" == e.refreshType && e.query.hasDailySchedule() && (e.query.schedule = null, e.saveQuery())
                    })
                }
            }
        }
        angular.module("redash.directives").directive("queryLink", e).directive("querySourceLink", t).directive("queryResultLink", r).directive("queryEditor", n).directive("queryRefreshSelect", o).directive("queryTimePicker", a).directive("queryFormatter", ["$http", i])
    }(),
    function () {
        "use strict";
        var e = angular.module("redash.directives");
        e.directive("editDashboardForm", ["Events", "$http", "$location", "$timeout", "Dashboard", function (e, t, r, n, i) {
            return {
                restrict: "E",
                scope: {
                    dashboard: "="
                },
                templateUrl: "/views/edit_dashboard.html",
                replace: !0,
                link: function (a, o, s) {
                    var u = o.find(".gridster ul").gridster({
                            widget_margins: [5, 5],
                            widget_base_dimensions: [260, 100],
                            min_cols: 2,
                            max_cols: 2,
                            serialize_params: function (e, t) {
                                return {
                                    col: t.col,
                                    row: t.row,
                                    id: e.data("widget-id")
                                }
                            }
                        }).data("gridster"),
                        l = '<li data-widget-id="{id}" class="widget panel panel-default gs-w"><div class="panel-heading">{name}</div></li>';
                    a.$watch("dashboard.layout", function () {
                        n(function () {
                            if (u.remove_all_widgets(), a.dashboard.widgets && a.dashboard.widgets.length) {
                                var e = [];
                                _.each(a.dashboard.widgets, function (t, r) {
                                    _.each(t, function (t, n) {
                                        e.push({
                                            id: t.id,
                                            col: n + 1,
                                            row: r + 1,
                                            ySize: 1,
                                            xSize: t.width,
                                            name: t.getName()
                                        })
                                    })
                                }), _.each(e, function (e) {
                                    var t = l.replace("{id}", e.id).replace("{name}", e.name);
                                    u.add_widget(t, e.xSize, e.ySize, e.col, e.row)
                                })
                            }
                        })
                    }, !0), a.saveDashboard = function () {
                        if (a.saveInProgress = !0, a.dashboard.id) {
                            var n = $(o).find(".gridster ul").data("gridster").serialize(),
                                s = [];
                            _.each(_.sortBy(n, function (e) {
                                return 10 * e.row + e.col
                            }), function (e) {
                                var t = e.row - 1,
                                    r = e.col - 1;
                                s[t] = s[t] || [], r > 0 && void 0 == s[t][r - 1] ? s[t][r - 1] = e.id : s[t][r] = e.id
                            }), a.dashboard.layout = s, s = JSON.stringify(s), i.save({
                                slug: a.dashboard.id,
                                name: a.dashboard.name,
                                layout: s
                            }, function (e) {
                                a.dashboard = e, a.saveInProgress = !1, $(o).modal("hide")
                            }), e.record(currentUser, "edit", "dashboard", a.dashboard.id)
                        } else t.post("api/dashboards", {
                            name: a.dashboard.name
                        }).success(function (e) {
                            $(o).modal("hide"), a.dashboard = {
                                name: null,
                                layout: null
                            }, a.saveInProgress = !1, r.path("/dashboard/" + e.slug).replace()
                        }), e.record(currentUser, "create", "dashboard")
                    }
                }
            }
        }]), e.directive("newWidgetForm", ["Query", "Widget", "growl", function (e, t, r) {
            return {
                restrict: "E",
                scope: {
                    dashboard: "="
                },
                templateUrl: "/views/new_widget_form.html",
                replace: !0,
                link: function (n, i, a) {
                    n.widgetSizes = [{
                        name: "Regular",
                        value: 1
                    }, {
                        name: "Double",
                        value: 2
                    }], n.type = "visualization", n.isVisualization = function () {
                        return "visualization" == n.type
                    }, n.isTextBox = function () {
                        return "textbox" == n.type
                    }, n.setType = function (e) {
                        n.type = e, "textbox" == e ? n.widgetSizes.push({
                            name: "Hidden",
                            value: 0
                        }) : n.widgetSizes.length > 2 && n.widgetSizes.pop()
                    };
                    var o = function () {
                        n.saveInProgress = !1, n.widgetSize = 1, n.selectedVis = null, n.query = {}, n.selected_query = void 0, n.text = ""
                    };
                    o(), n.loadVisualizations = function () {
                        n.query.selected && e.get({
                            id: n.query.selected.id
                        }, function (e) {
                            e && (n.selected_query = e, e.visualizations.length && (n.selectedVis = e.visualizations[0]))
                        })
                    }, n.searchQueries = function (t) {
                        !t || t.length < 3 || e.search({
                            q: t
                        }, function (e) {
                            n.queries = e
                        })
                    }, n.$watch("query", function () {
                        n.loadVisualizations()
                    }, !0), n.saveWidget = function () {
                        n.saveInProgress = !0;
                        var e = new t({
                            visualization_id: n.selectedVis && n.selectedVis.id,
                            dashboard_id: n.dashboard.id,
                            options: {},
                            width: n.widgetSize,
                            text: n.text
                        });
                        e.$save().then(function (e) {
                            n.dashboard.layout = e.layout;
                            var r = new t(e.widget);
                            e.new_row ? n.dashboard.widgets.push([r]) : n.dashboard.widgets[n.dashboard.widgets.length - 1].push(r), $("#add_query_dialog").modal("hide"), o()
                        })["catch"](function () {
                            r.addErrorMessage("Widget can not be added")
                        })["finally"](function () {
                            n.saveInProgress = !1
                        })
                    }
                }
            }
        }])
    }();
var durationHumanize = function (e) {
        var t = "";
        if (void 0 == e) t = "-";
        else if (60 > e) t = Math.round(e) + "s";
        else if (e > 86400) {
            var r = Math.round(parseFloat(e) / 60 / 60 / 24);
            t = r + "days"
        } else if (e >= 3600) {
            var n = Math.round(parseFloat(e) / 60 / 60);
            t = n + "h"
        } else {
            var i = Math.round(parseFloat(e) / 60);
            t = i + "m"
        }
        return t
    },
    urlPattern = /(^|[\s\n]|<br\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;
angular.module("redash.filters", []).filter("durationHumanize", function () {
        return durationHumanize
    }).filter("scheduleHumanize", function () {
        return function (e) {
            if (null === e) return "Never";
            if (null !== e.match(/\d\d:\d\d/)) {
                var t = e.split(":"),
                    r = moment.utc().hour(t[0]).minute(t[1]).local().format("HH:mm");
                return "Every day at " + r
            }
            return "Every " + durationHumanize(parseInt(e))
        }
    }).filter("toHuman", function () {
        return function (e) {
            return e.replace(/_/g, " ").replace(/(?:^|\s)\S/g, function (e) {
                return e.toUpperCase()
            })
        }
    }).filter("colWidth", function () {
        return function (e) {
            return 0 == e ? 0 : 1 == e ? 6 : 12
        }
    }).filter("capitalize", function () {
        return function (e) {
            return e ? _.str.capitalize(e) : null
        }
    }).filter("dateTime", function () {
        return function (e) {
            return moment(e).format(clientConfig.dateTimeFormat)
        }
    }).filter("linkify", function () {
        return function (e) {
            return e.replace(urlPattern, "$1<a href='$2' target='_blank'>$2</a>")
        }
    }).filter("markdown", ["$sce", function (e) {
        return function (t) {
            if (!t) return "";
            var r = marked(t);
            return clientConfig.allowScriptsInUserInput && (r = e.trustAsHtml(r)), r
        }
    }]).filter("trustAsHtml", ["$sce", function (e) {
        return function (t) {
            return t ? e.trustAsHtml(t) : ""
        }
    }]).filter("remove", function () {
        return function (e, t) {
            if (void 0 == e) return e;
            if (t instanceof Array) var r = function (e) {
                return -1 == t.indexOf(e)
            };
            else var r = function (e) {
                return t != e
            };
            for (var n = [], i = 0; i < e.length; i++) r(e[i]) && n.push(e[i]);
            return n
        }
    }),
    function () {
        var e = function (e, t, r) {
                t.record(currentUser, "view", "page", "alerts"), e.$parent.pageTitle = "Alerts", e.alerts = [], r.query(function (t) {
                    var r = {
                        ok: "label label-success",
                        triggered: "label label-danger",
                        unknown: "label label-warning"
                    };
                    _.each(t, function (e) {
                        e["class"] = r[e.state]
                    }), e.alerts = t
                }), e.gridConfig = {
                    isPaginationEnabled: !0,
                    itemsByPage: 50,
                    maxSize: 8
                }, e.gridColumns = [{
                    label: "Name",
                    map: "name",
                    cellTemplate: '<a href="alerts/{{dataRow.id}}">{{dataRow.name}}</a> (<a href="queries/{{dataRow.query.id}}">query</a>)'
                }, {
                    label: "Created By",
                    map: "user.name"
                }, {
                    label: "State",
                    cellTemplate: '<span ng-class="dataRow.class">{{dataRow.state | uppercase}}</span> since <span am-time-ago="dataRow.updated_at"></span>'
                }, {
                    label: "Created At",
                    cellTemplate: '<span am-time-ago="dataRow.created_at"></span>'
                }]
            },
            t = function (e, t, r, n, i, a, o, s) {
                e.selectedTab = "users", e.$parent.pageTitle = "Alerts", e.alertId = t.alertId, "new" === e.alertId ? a.record(currentUser, "view", "page", "alerts/new") : a.record(currentUser, "view", "alert", e.alertId), e.onQuerySelected = function (t) {
                    e.selectedQuery = t, t.getQueryResultPromise().then(function (t) {
                        e.queryResult = t, e.alert.options.column = e.alert.options.column || t.getColumnNames()[0]
                    })
                }, "new" === e.alertId ? e.alert = new o({
                    options: {}
                }) : e.alert = o.get({
                    id: e.alertId
                }, function (t) {
                    e.onQuerySelected(new i(e.alert.query))
                }), e.ops = ["greater than", "less than", "equals"], e.selectedQuery = null, e.getDefaultName = function () {
                    return e.alert.query ? _.template("<%= query.name %>: <%= options.column %> <%= options.op %> <%= options.value %>", e.alert) : void 0
                }, e.searchQueries = function (t) {
                    !t || t.length < 3 || i.search({
                        q: t
                    }, function (t) {
                        e.queries = t
                    })
                }, e.saveChanges = function () {
                    void 0 !== e.alert.name && "" !== e.alert.name || (e.alert.name = e.getDefaultName()), "" !== e.alert.rearm && 0 !== e.alert.rearm || (e.alert.rearm = null), e.alert.$save(function (t) {
                        n.addSuccessMessage("Saved."), "new" === e.alertId && r.path("/alerts/" + t.id).replace()
                    }, function () {
                        n.addErrorMessage("Failed saving alert.")
                    })
                }
            };
        angular.module("redash.directives").directive("alertSubscriptions", ["$q", "$sce", "AlertSubscription", "Destination", "growl", function (e, t, r, n, i) {
            return {
                restrict: "E",
                replace: !0,
                templateUrl: "/views/alerts/alert_subscriptions.html",
                scope: {
                    alertId: "="
                },
                controller: ["$scope", function (a) {
                    a.newSubscription = {}, a.subscribers = [], a.destinations = [], a.currentUser = currentUser;
                    var o = n.query().$promise,
                        s = r.query({
                            alertId: a.alertId
                        }).$promise;
                    e.all([o, s]).then(function (e) {
                        var t = e[0],
                            r = e[1],
                            n = _.compact(_.map(r, function (e) {
                                return e.destination && e.destination.id
                            })),
                            i = _.compact(_.map(r, function (e) {
                                return e.destination ? void 0 : e.user.id
                            }));
                        a.destinations = _.filter(t, function (e) {
                            return !_.contains(n, e.id)
                        }), _.contains(i, currentUser.id) || a.destinations.unshift({
                            user: {
                                name: currentUser.name
                            }
                        }), a.newSubscription.destination = a.destinations[0], a.subscribers = r
                    }), a.destinationsDisplay = function (e) {
                        return e ? (e.destination ? e = e.destination : e.user && (e = {
                            name: e.user.name + " (Email)",
                            icon: "fa-envelope",
                            type: "user"
                        }), t.trustAsHtml('<i class="fa ' + e.icon + '"></i>&nbsp;' + e.name)) : ""
                    }, a.saveSubscriber = function () {
                        var e = new r({
                            alert_id: a.alertId
                        });
                        a.newSubscription.destination.id && (e.destination_id = a.newSubscription.destination.id), e.$save(function () {
                            i.addSuccessMessage("Subscribed."), a.subscribers.push(e), a.destinations = _.without(a.destinations, a.newSubscription.destination), a.destinations.length > 0 ? a.newSubscription.destination = a.destinations[0] : a.newSubscription.destination = void 0, console.log("dests: ", a.destinations)
                        }, function (e) {
                            i.addErrorMessage("Failed saving subscription.")
                        })
                    }, a.unsubscribe = function (e) {
                        var t = e.destination,
                            r = e.user;
                        e.$delete(function () {
                            i.addSuccessMessage("Unsubscribed"), a.subscribers = _.without(a.subscribers, e), t ? a.destinations.push(t) : r.id == currentUser.id && a.destinations.push({
                                user: {
                                    name: currentUser.name
                                }
                            }), 1 == a.destinations.length && (a.newSubscription.destination = a.destinations[0])
                        }, function () {
                            i.addErrorMessage("Failed unsubscribing.")
                        })
                    }
                }]
            }
        }]), angular.module("redash.controllers").controller("AlertsCtrl", ["$scope", "Events", "Alert", e]).controller("AlertCtrl", ["$scope", "$routeParams", "$location", "growl", "Query", "Events", "Alert", "Destination", t])
    }();
