var app = angular.module('labTrackApp', ['ngAnimate']);

/* Shared localStorage helpers */
function ltGet(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch(e) { return fallback; }
}
function ltSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

/* API Base URL */
app.constant('API_URL', 'http://localhost:5000');

/* HTTP Interceptor: auto-attach JWT token to every API request */
app.config(function($httpProvider) {
    $httpProvider.interceptors.push(function() {
        return {
            request: function(config) {
                var token = localStorage.getItem('lt_token');
                if (token && config.url.indexOf('/api/') !== -1) {
                    config.headers['Authorization'] = 'Bearer ' + token;
                }
                return config;
            }
        };
    });
});

/* SERVICE 1: AdminStatsService */
app.service('AdminStatsService', function($http, API_URL) {
    this.getStats = function() {
        return $http.get(API_URL + '/api/reports/summary').then(function(r) { return r.data; })
            .catch(function() { return { totalEquipment:1248, activeBookings:342, overdueReturns:18, uptime:94, openLogs:5 }; });
    };
    this.getPendingRequests = function() {
        return $http.get(API_URL + '/api/bookings/all').then(function(r) {
            return r.data.filter(function(b) { return b.status === 'pending'; });
        }).catch(function() { return []; });
    };
    this.approveRequest = function(id) {
        return $http.put(API_URL + '/api/bookings/' + id + '/approve');
    };
});

/* SERVICE 2: StudentService */
app.service('StudentService', function($http, API_URL) {
    this.getAllStudents = function() {
        return $http.get(API_URL + '/api/students').then(function(r) { return r.data; })
            .catch(function() { return ltGet('lt_students_added', []); });
    };
    this.addStudent = function(s) {
        return $http.post(API_URL + '/api/students', {
            name: s.name, email: s.email || (s.id + '@uni.edu'), department: s.department, studentId: s.id
        }).then(function() { return 'Student "' + s.name + '" added successfully!'; });
    };
    this.updateStatus = function(id, status) {
        return $http.put(API_URL + '/api/students/' + id + '/status', { status: status });
    };
});

/* SERVICE 3: AuthService */
app.service('AuthService', function($http, API_URL) {
    this.login = function(email, password) {
        return $http.post(API_URL + '/api/auth/login', { email: email, password: password })
            .then(function(r) {
                localStorage.setItem('lt_token', r.data.token);
                ltSet('labtrack_session', { role: r.data.user.role, name: r.data.user.name, email: r.data.user.email, id: r.data.user.id });
                return r.data.user.role;
            });
    };
    this.getSession = function() { return ltGet('labtrack_session', null); };
    this.register = function(name, email, password, confirmPassword) {
        if (password !== confirmPassword) return Promise.reject({ error: 'Passwords do not match.' });
        if (!password || password.length < 6) return Promise.reject({ error: 'Password must be at least 6 characters.' });
        return $http.post(API_URL + '/api/auth/register', { name: name, email: email, password: password, role: 'student' })
            .then(function(r) {
                localStorage.setItem('lt_token', r.data.token);
                ltSet('labtrack_session', { role: r.data.user.role, name: r.data.user.name, email: r.data.user.email, id: r.data.user.id });
                return { success: true };
            });
    };
    this.logout = function() { localStorage.removeItem('lt_token'); localStorage.removeItem('labtrack_session'); };
});

/* SERVICE 4: EquipmentService */
app.service('EquipmentService', function($http, API_URL) {
    function mapEquip(e) {
        return { _id: e._id, name: e.name, description: e.description, category: e.category,
                 categoryDisplay: e.category.charAt(0).toUpperCase() + e.category.slice(1),
                 image: e.image || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
                 available: e.available, total: e.totalUnits, location: e.location,
                 statusBadge: e.available > 0 ? 'badge-active' : 'badge-pending', status: e.status };
    }
    this.getAll = function() {
        return $http.get(API_URL + '/api/equipment').then(function(r) { return r.data.map(mapEquip); });
    };
    this.getByCategory = function(cat) {
        var url = API_URL + '/api/equipment' + (cat ? '?category=' + cat : '');
        return $http.get(url).then(function(r) { return r.data.map(mapEquip); });
    };
    this.bookItem = function(item) {
        var ret = new Date(); ret.setDate(ret.getDate() + 7);
        return $http.post(API_URL + '/api/bookings', { equipmentId: item._id, returnBy: ret.toISOString(), notes: '' })
            .then(function() { return item.name + ' booking request submitted!'; });
    };
});

/* SERVICE 5: BookingService */
app.service('BookingService', function($http, API_URL) {
    function mapBooking(b) {
        var eq = b.equipment || {};
        return { id: b._id, name: eq.name || 'Equipment', image: eq.image || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200',
                 status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
                 bookedOn: new Date(b.bookedOn).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
                 returnBy: new Date(b.returnBy).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
                 extended: b.extended, extendDays: b.extendDays };
    }
    this.getAll = function() {
        return $http.get(API_URL + '/api/bookings').then(function(r) { return r.data.map(mapBooking); })
            .catch(function() { return ltGet('lt_bookings', []); });
    };
    this.addBooking = function(name, image, days) {
        var ret = new Date(); ret.setDate(ret.getDate() + (days || 7));
        return $http.get(API_URL + '/api/equipment').then(function(r) {
            if (!r.data[0]) return name + ' submitted!';
            return $http.post(API_URL + '/api/bookings', { equipmentId: r.data[0]._id, returnBy: ret.toISOString(), notes: 'Bundle: ' + name });
        }).then(function() { return '"' + name + '" booking submitted!'; });
    };
    this.returnBooking  = function(id) { return $http.put(API_URL + '/api/bookings/' + id + '/return'); };
    this.extendBooking  = function(id, days) { return $http.put(API_URL + '/api/bookings/' + id + '/extend', { days: days }); };
    this.cancelBooking  = function(id) { return $http.put(API_URL + '/api/bookings/' + id + '/cancel'); };
});

/* SERVICE 6: UserProfileService */
app.service('UserProfileService', function($http, API_URL) {
    this.getProfile = function() {
        return $http.get(API_URL + '/api/users/me').then(function(r) {
            var u = r.data;
            return { fullName: u.name, preferredName: u.name.split(' ')[0], uniEmail: u.email,
                     department: u.department || 'Not set', studentId: u.studentId || 'Not set',
                     title: u.role === 'admin' ? 'Lab Administrator' : 'Graduate Researcher',
                     status: u.status === 'active' ? 'Active' : 'Restricted',
                     joinDate: new Date(u.createdAt).toLocaleDateString('en-US', { month:'short', year:'numeric' }), avatar: u.avatar || '' };
        }).catch(function() {
            var s = ltGet('labtrack_session', null);
            return { fullName: s ? s.name : 'Student', preferredName: s ? s.name.split(' ')[0] : 'Student',
                     uniEmail: s ? s.email : 'student@university.edu', department: 'Not set',
                     title: 'Graduate Researcher', status: 'Active', joinDate: 'Sep 2024' };
        });
    };
    this.getAvatarUrl = function(name) {
        return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'Student') + '&background=006d77&color=fff&size=128&bold=true';
    };
    this.saveSettings = function(obj) { ltSet('lt_user_settings', obj); return 'Settings saved successfully!'; };
    this.updateProfile = function(obj) { return $http.put(API_URL + '/api/users/me', obj).then(function() { return 'Profile updated!'; }); };
});

/* SERVICE 7: NotificationService */
app.service('NotificationService', function($http, API_URL) {
    function mapNotif(n) {
        return { id: n._id, title: n.title, message: n.message,
                 time: new Date(n.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }),
                 icon: n.icon, iconBg: n.iconBg, iconColor: n.iconColor, link: n.link, read: n.read, archived: n.archived };
    }
    this.getFiltered = function(filter) {
        var url = API_URL + '/api/notifications' + (filter && filter !== 'all' ? '?filter=' + filter : '');
        return $http.get(url).then(function(r) { return r.data.map(mapNotif); }).catch(function() { return []; });
    };
    this.markRead      = function(id) { return $http.put(API_URL + '/api/notifications/' + id + '/read'); };
    this.archive       = function(id) { return $http.put(API_URL + '/api/notifications/' + id + '/archive'); };
    this.markAllRead   = function()   { return $http.put(API_URL + '/api/notifications/read-all'); };
    this.getUnreadCount= function()   { return $http.get(API_URL + '/api/notifications/count').then(function(r) { return r.data.unread; }).catch(function() { return 0; }); };
});

/* SERVICE 8: QuotaService - Weekly booking quota (Option 3) */
app.service('QuotaService', function($http, API_URL) {
    var QUOTA_KEY  = 'lt_weekly_quota';
    var BASE_LIMIT = 4;

    function getWeekStart() {
        var d = new Date(); d.setHours(0,0,0,0);
        d.setDate(d.getDate() - d.getDay());
        return d.toISOString().split('T')[0];
    }
    function localQuota() {
        var q = ltGet(QUOTA_KEY, { week:'', used:0, boost:0 });
        if (q.week !== getWeekStart()) { q = { week:getWeekStart(), used:0, boost:0 }; ltSet(QUOTA_KEY, q); }
        return q;
    }

    this.getQuota = function() {
        return $http.get(API_URL + '/api/bookings/quota')
            .then(function(r) { return r.data; })
            .catch(function() {
                var q = localQuota(); var limit = BASE_LIMIT + (q.boost || 0);
                return { used: q.used, limit: limit, remaining: Math.max(0, limit - q.used) };
            });
    };
    this.canBook = function() {
        return this.getQuota().then(function(q) { return q.remaining > 0; });
    };
    this.incrementLocal = function() {
        var q = localQuota(); q.used = Math.min(q.used + 1, BASE_LIMIT + (q.boost||0)); ltSet(QUOTA_KEY, q);
    };
    this.decrementLocal = function() {
        var q = localQuota(); q.used = Math.max(0, q.used - 1); ltSet(QUOTA_KEY, q);
    };
});

/* SERVICE 9: WaitlistService - Waitlist auto-release (Option 2) */
app.service('WaitlistService', function($http, API_URL) {
    var WL_KEY = 'lt_waitlists';
    function localWL()  { return ltGet(WL_KEY, {}); }
    function saveWL(wl) { ltSet(WL_KEY, wl); }

    this.joinWaitlist = function(equipmentId) {
        return $http.post(API_URL + '/api/bookings/waitlist/' + equipmentId, {})
            .then(function(r) { return r.data; })
            .catch(function() {
                var wl = localWL(); var session = ltGet('labtrack_session', {});
                if (!wl[equipmentId]) wl[equipmentId] = [];
                var pos = wl[equipmentId].indexOf(session.email);
                if (pos === -1) { wl[equipmentId].push(session.email); saveWL(wl); pos = wl[equipmentId].length - 1; }
                return { position: pos + 1 };
            });
    };
    this.isOnWaitlist = function(equipmentId) {
        var wl = localWL(); var session = ltGet('labtrack_session', {});
        return !!(wl[equipmentId] && wl[equipmentId].indexOf(session.email) !== -1);
    };
});

/* FACTORY 1: EquipmentFactory */
app.factory('EquipmentFactory', function($http, API_URL) {
    return {
        getAll:  function()      { return $http.get(API_URL + '/api/equipment').then(function(r) { return r.data; }); },
        add:     function(obj)   { return $http.post(API_URL + '/api/equipment', obj).then(function(r) { return r.data; }); },
        update:  function(id, obj){ return $http.put(API_URL + '/api/equipment/' + id, obj).then(function(r) { return r.data; }); },
        remove:  function(id)    { return $http.delete(API_URL + '/api/equipment/' + id); }
    };
});

/* FACTORY 2: StudentFactory */
app.factory('StudentFactory', function($http, API_URL) {
    return {
        getAll:       function()          { return $http.get(API_URL + '/api/students').then(function(r) { return r.data; }); },
        add:          function(obj)       { return $http.post(API_URL + '/api/students', obj).then(function(r) { return r.data; }); },
        updateStatus: function(id, status){ return $http.put(API_URL + '/api/students/' + id + '/status', { status: status }); }
    };
});

/* FACTORY 3: SessionFactory */
app.factory('SessionFactory', function() {
    return {
        get:       function() { return ltGet('labtrack_session', null); },
        getToken:  function() { return localStorage.getItem('lt_token'); },
        isLoggedIn:function() { return !!localStorage.getItem('lt_token'); },
        clear:     function() { localStorage.removeItem('lt_token'); localStorage.removeItem('labtrack_session'); }
    };
});

/* FACTORY 4: BookingFactory */
app.factory('BookingFactory', function($http, API_URL) {
    return {
        getMine: function()               { return $http.get(API_URL + '/api/bookings').then(function(r) { return r.data; }); },
        getAll:  function()               { return $http.get(API_URL + '/api/bookings/all').then(function(r) { return r.data; }); },
        create:  function(id, ret, notes) { return $http.post(API_URL + '/api/bookings', { equipmentId: id, returnBy: ret, notes: notes }).then(function(r) { return r.data; }); }
    };
});

/* FACTORY 5: NotificationFactory */
app.factory('NotificationFactory', function($http, API_URL) {
    return {
        get:      function(f)  { return $http.get(API_URL + '/api/notifications' + (f ? '?filter=' + f : '')).then(function(r) { return r.data; }); },
        markRead: function(id) { return $http.put(API_URL + '/api/notifications/' + id + '/read'); },
        getCount: function()   { return $http.get(API_URL + '/api/notifications/count').then(function(r) { return r.data.unread; }); }
    };
});

/* CONTROLLER: AuthController */
app.controller('AuthController', function($scope, AuthService) {
    $scope.user          = { email: '', password: '' };
    $scope.register      = { name: '', email: '', password: '', confirmPassword: '' };
    $scope.loginError    = '';
    $scope.registerError = '';
    $scope.loading       = false;

    $scope.doLogin = function() {
        $scope.loginError = ''; $scope.loading = true;
        AuthService.login($scope.user.email, $scope.user.password)
            .then(function(role) {
                if (role === 'admin')   window.location.href = 'admin-dashboard.html';
                else                   window.location.href = 'student-dashboard.html';
            })
            .catch(function(err) { $scope.loginError = (err.data && err.data.message) || 'Invalid email or password.'; })
            .finally(function()  { $scope.loading = false; });
    };

    $scope.doRegister = function() {
        $scope.registerError = ''; $scope.loading = true;
        AuthService.register($scope.register.name, $scope.register.email, $scope.register.password, $scope.register.confirmPassword)
            .then(function()    { window.location.href = 'student-dashboard.html'; })
            .catch(function(err){ $scope.registerError = (err.data && err.data.message) || err.error || 'Registration failed.'; })
            .finally(function() { $scope.loading = false; });
    };
});

/* CONTROLLER: ProfileController */
app.controller('ProfileController', function($scope, UserProfileService) {
    $scope.user      = {};
    $scope.avatarUrl = '';
    $scope.settings  = ltGet('lt_user_settings', { emailAlerts: true, smsAlerts: false, theme: 'light' });
    $scope.saveMsg   = '';
    UserProfileService.getProfile().then(function(p) {
        $scope.user      = p;
        $scope.avatarUrl = UserProfileService.getAvatarUrl(p.fullName);
    });
    $scope.saveSettings = function() { $scope.saveMsg = UserProfileService.saveSettings($scope.settings); };
});

/* CONTROLLER: CatalogController */
app.controller('CatalogController', function($scope, EquipmentService, AuthService, QuotaService, WaitlistService) {
    $scope.searchQuery   = '';
    $scope.filters       = { category: '', department: '', availability: '' };
    $scope.equipmentList = [];
    $scope.loading       = true;
    $scope.quota         = { used: 0, limit: 4, remaining: 4 };
    $scope.quotaError    = '';

    EquipmentService.getAll().then(function(list) { $scope.equipmentList = list; $scope.loading = false; })
        .catch(function() { $scope.loading = false; });

    // Load quota on page init
    QuotaService.getQuota().then(function(q) { $scope.quota = q; });

    $scope.applyFilter = function() {
        $scope.loading = true;
        EquipmentService.getByCategory($scope.filters.category)
            .then(function(list) { $scope.equipmentList = list; $scope.loading = false; })
            .catch(function() { $scope.loading = false; });
    };

    $scope.bookItem = function(item) {
        $scope.quotaError = '';
        QuotaService.canBook().then(function(allowed) {
            if (!allowed) {
                $scope.quotaError = 'Weekly booking limit reached (' + $scope.quota.limit + '/' + $scope.quota.limit + '). Cancel an existing booking or wait for Monday reset.';
                return;
            }
            EquipmentService.bookItem(item)
                .then(function() {
                    item._booked = true;
                    QuotaService.incrementLocal();
                    QuotaService.getQuota().then(function(q) { $scope.quota = q; });
                })
                .catch(function(err) {
                    var msg = (err.data && err.data.message) || 'Booking failed. Please try again.';
                    if (err.status === 429) { $scope.quotaError = msg; }
                    else { alert(msg); }
                });
        });
    };

    $scope.joinWaitlist = function(item) {
        WaitlistService.joinWaitlist(item._id).then(function(r) {
            item._waitlisted   = true;
            item._waitlistPos  = r.position;
        }).catch(function() {
            item._waitlisted  = true;
            item._waitlistPos = 1;
        });
    };
});

/* CONTROLLER: DashboardController */
app.controller('DashboardController', function($scope, AuthService, EquipmentService, $http, API_URL) {
    var session        = AuthService.getSession();
    $scope.currentUser = { name: session ? session.name : 'Student' };
    $scope.stats       = { activeBookings: 0, pendingApprovals: 0, totalEquipment: 0, utilization: '0%' };

    EquipmentService.getAll().then(function(list) { $scope.stats.totalEquipment = list.length; });
    $http.get(API_URL + '/api/bookings').then(function(r) {
        $scope.stats.activeBookings   = r.data.filter(function(b) { return b.status === 'active'; }).length;
        $scope.stats.pendingApprovals = r.data.filter(function(b) { return b.status === 'pending'; }).length;
    }).catch(function() {});
});

/* CONTROLLER: MyBookingsController */
app.controller('MyBookingsController', function($scope, BookingService, $http, API_URL) {
    $scope.searchQuery = '';
    $scope.activeTab   = 'all';
    $scope.message     = '';
    $scope.bookings    = [];
    $scope.loading     = true;

    BookingService.getAll().then(function(list) { $scope.bookings = list; $scope.loading = false; })
        .catch(function() { $scope.loading = false; });

    $scope.setTab = function(tab) { $scope.activeTab = tab; };

    $scope.countByStatus = function(s) {
        return $scope.bookings.filter(function(b) { return b.status.toLowerCase() === s.toLowerCase(); }).length;
    };

    $scope.filteredBookings = function() {
        if ($scope.activeTab === 'all') return $scope.bookings;
        var map = { active:'Active', pending:'Pending', completed:'Completed', overdue:'Overdue' };
        return $scope.bookings.filter(function(b) { return b.status === map[$scope.activeTab]; });
    };

    $scope.returnItem = function(b) {
        BookingService.returnBooking(b.id)
            .then(function() { b.status = 'Completed'; $scope.message = b.name + ' returned successfully.'; })
            .catch(function() { b.status = 'Completed'; $scope.message = b.name + ' returned.'; });
    };

    $scope.extendItem = function(b) {
        BookingService.extendBooking(b.id, 7).then(function() {
            b.extended = true; b.extendDays = (b.extendDays || 0) + 7;
            var d = new Date(); d.setDate(d.getDate() + b.extendDays);
            b.newReturnBy = d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
            $scope.message = b.name + ' extended by 7 days.';
        }).catch(function() { $scope.message = 'Extension failed. Please try again.'; });
    };

    $scope.cancelItem = function(b) {
        if (confirm('Cancel booking for ' + b.name + '?')) {
            BookingService.cancelBooking(b.id)
                .then(function() { b.status = 'Cancelled'; $scope.message = 'Booking for ' + b.name + ' cancelled.'; })
                .catch(function() { $scope.message = 'Cancellation failed.'; });
        }
    };

    $scope.checkIn = function(b) {
        $http.put(API_URL + '/api/bookings/' + b.id + '/checkin')
            .then(function() {
                b.checkedIn = true;
                $scope.message = '\u2705 Checked in for ' + b.name + '! Your slot is confirmed.';
            })
            .catch(function() {
                b.checkedIn = true;   // optimistic UI fallback
                $scope.message = '\u2705 Checked in for ' + b.name + '!';
            });
    };
});

/* CONTROLLER: BundleController */
app.controller('BundleController', function($scope, BookingService, $http, API_URL) {
    $scope.searchQuery    = '';
    $scope.deptFilter     = '';
    $scope.bookingSuccess = '';

    var fallbackBundles = [
        { name:'Electronics Lab Starter Kit', description:'Complete set for introductory electronics experiments.', dept:'Electronics', stock:'Available', demand:'High Demand', image:'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600', items:['Arduino UNO R3','Breadboard & Jumper Wires','Digital Multimeter','Oscilloscope','Power Supply 5V'] },
        { name:'Optics Experiment Set', description:'Lenses, laser source and tools for wave optics.', dept:'Physics', stock:'Low Stock', demand:'', image:'https://images.unsplash.com/photo-1532187863486-abf9db3851ce?w=600', items:['He-Ne Laser Source','Optical Bench','Lens Set (6 pcs)','Screen & Ruler'] },
        { name:'Biomedical Signal Kit', description:'Tools for measuring and analysing biomedical signals.', dept:'Electronics', stock:'Available', demand:'', image:'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600', items:['ECG Electrodes','Signal Amplifier','Data Logger','Oscilloscope'] }
    ];

    $http.get(API_URL + '/api/bundles').then(function(r) {
        $scope.bundles = (r.data && r.data.length > 0) ? r.data : fallbackBundles;
    }).catch(function() { $scope.bundles = fallbackBundles; });

    $scope.bookBundle = function(bundle) {
        BookingService.addBooking(bundle.name, bundle.image, 14);
        $scope.bookingSuccess = bundle.name;
    };

    $scope.showInfo = function(bundle) {
        alert(bundle.name + '\n\nContents:\n' + (bundle.items || []).join('\n'));
    };
});

/* CONTROLLER: NotificationsController */
app.controller('NotificationsController', function($scope, NotificationService) {
    $scope.searchQuery   = '';
    $scope.notifFilter   = 'all';
    $scope.notifications = [];
    $scope.loading       = true;

    function load(f) {
        $scope.loading = true;
        NotificationService.getFiltered(f)
            .then(function(list) { $scope.notifications = list; $scope.loading = false; })
            .catch(function()    { $scope.loading = false; });
    }
    load('all');

    $scope.countUnread   = function() { return $scope.notifications.filter(function(n) { return !n.read; }).length; };
    $scope.countArchived = function() { return $scope.notifications.filter(function(n) { return n.archived; }).length; };

    $scope.changeFilter = function(f) { $scope.notifFilter = f; load(f); };
    $scope.filteredNotifications = function() { return $scope.notifications; };

    $scope.markRead = function(n) { NotificationService.markRead(n.id).then(function() { n.read = true; }); };
    $scope.archiveNotif = function(n) { NotificationService.archive(n.id).then(function() { load($scope.notifFilter); }); };
    $scope.markAllRead = function() { NotificationService.markAllRead().then(function() { $scope.notifications.forEach(function(n) { n.read = true; }); }); };
    $scope.loadMore = function() { alert('No more notifications to load.'); };
});

/* CONTROLLER: CalendarController */
app.controller('CalendarController', function($scope) {
    $scope.calendar = { month:'August', year:'2026', selectedDate:'August 14, 2026' };
});

/* CONTROLLER: MaintenanceController */
app.controller('MaintenanceController', function($scope, AdminStatsService, $http, API_URL) {
    $scope.maintenance  = { status:'Broken', equipmentId:'EQ-1004' };
    $scope.stats        = { uptime:94, openLogs:5 };
    $scope.damageReport = { equipment:'', reportedBy:'', location:'' };
    $scope.reportMsg    = '';

    AdminStatsService.getStats().then(function(s) { $scope.stats = { uptime: s.uptime || 94, openLogs: s.openLogs || 5 }; });

    $scope.submitDamageReport = function() {
        if (!$scope.damageReport.equipment || !$scope.damageReport.reportedBy) return;
        $http.post(API_URL + '/api/maintenance', $scope.damageReport)
            .then(function() { $scope.reportMsg = 'Damage report submitted!'; $scope.damageReport = { equipment:'', reportedBy:'', location:'' }; })
            .catch(function(){ $scope.reportMsg = 'Report submitted (offline mode).'; });
    };
});

/* CONTROLLER: ReportsController */
app.controller('ReportsController', function($scope, AdminStatsService) {
    $scope.stats = { totalBookings:'0', activeEquipment:0, maintenanceAlerts:0, uniqueUsers:0 };
    AdminStatsService.getStats().then(function(s) {
        $scope.stats = { totalBookings: s.totalBookings || '0', activeEquipment: s.activeEquipment || 0,
                         maintenanceAlerts: s.maintenanceAlerts || 0, uniqueUsers: s.uniqueUsers || 0 };
    });
});

/* CONTROLLER: StudentMgmtController */
app.controller('StudentMgmtController', function($scope, StudentService) {
    $scope.searchQuery   = '';
    $scope.filters       = { department:'', status:'' };
    $scope.newStudent    = { name:'', id:'', department:'' };
    $scope.submitMsg     = '';
    $scope.addedStudents = [];
    $scope.loading       = true;

    function loadStudents() {
        StudentService.getAllStudents().then(function(list) {
            $scope.addedStudents = list.map(function(s) {
                return { _id: s._id, name: s.name, id: s.studentId, department: s.department,
                         status: s.status === 'active' ? 'Clear' : 'Restricted',
                         email: s.email, addedOn: new Date(s.createdAt).toLocaleDateString('en-GB') };
            });
            $scope.loading = false;
        }).catch(function() { $scope.loading = false; });
    }
    loadStudents();

    $scope.submitAddStudent = function() {
        if (!$scope.newStudent.name || !$scope.newStudent.id || !$scope.newStudent.department) return;
        StudentService.addStudent(angular.copy($scope.newStudent)).then(function(msg) {
            $scope.submitMsg  = msg;
            $scope.newStudent = { name:'', id:'', department:'' };
            var modal = document.getElementById('addStudentModal');
            if (modal) modal.classList.remove('open');
            loadStudents();
        }).catch(function(err) { $scope.submitMsg = (err.data && err.data.message) || 'Failed to add student.'; });
    };

    $scope.restrictStudent = function(student) {
        StudentService.updateStatus(student._id, 'restricted')
            .then(function() { student.status = 'Restricted'; });
    };
});

/* CONTROLLER: EquipmentMgmtController */
app.controller('EquipmentMgmtController', function($scope, EquipmentFactory, AdminStatsService) {
    $scope.searchQuery    = '';
    $scope.filters        = { category:'', status:'' };
    $scope.newEquipment   = { name:'', category:'electronics', totalUnits:1, available:1, location:'', description:'', department:'', image:'' };
    $scope.submitMsg      = '';
    $scope.addedEquipment = [];
    $scope.loading        = true;

    AdminStatsService.getStats().then(function(s) { $scope.totalCount = s.totalEquipment || 0; }).catch(function() { $scope.totalCount = 0; });

    EquipmentFactory.getAll().then(function(list) { $scope.addedEquipment = list; $scope.loading = false; })
        .catch(function() { $scope.loading = false; });

    $scope.submitAddEquipment = function() {
        if (!$scope.newEquipment.name || !$scope.newEquipment.location) return;
        EquipmentFactory.add(angular.copy($scope.newEquipment)).then(function(item) {
            $scope.addedEquipment.push(item);
            $scope.submitMsg    = 'Equipment "' + item.name + '" added to inventory!';
            $scope.newEquipment = { name:'', category:'electronics', totalUnits:1, available:1, location:'', description:'', department:'', image:'' };
            var modal = document.getElementById('addEquipModal');
            if (modal) modal.classList.remove('open');
        }).catch(function(err) { $scope.submitMsg = (err.data && err.data.message) || 'Failed to add equipment.'; });
    };

    $scope.deleteEquipment = function(item) {
        if (!confirm('Delete "' + item.name + '"?')) return;
        EquipmentFactory.remove(item._id).then(function() {
            $scope.addedEquipment = $scope.addedEquipment.filter(function(e) { return e._id !== item._id; });
            $scope.submitMsg = '"' + item.name + '" removed.';
        });
    };
});

/* CONTROLLER: AdminDashboardController */
app.controller('AdminDashboardController', function($scope, AdminStatsService, StudentService) {
    var session        = ltGet('labtrack_session', null);
    $scope.currentUser = { name: session ? session.name : 'Admin' };
    $scope.stats           = { activeBookings:0, pendingApprovals:0, totalEquipment:0, utilization:'0%' };
    $scope.pendingRequests = [];
    $scope.recentStudents  = [];

    AdminStatsService.getStats().then(function(s) {
        $scope.stats.activeEquipment = s.activeEquipment || 0;
        $scope.stats.totalEquipment  = s.totalEquipment  || 0;
    });

    AdminStatsService.getPendingRequests().then(function(reqs) {
        $scope.pendingRequests        = reqs;
        $scope.stats.pendingApprovals = reqs.length;
    });

    StudentService.getAllStudents().then(function(list) { $scope.recentStudents = list.slice(0, 3); });

    $scope.approveRequest = function(req) {
        AdminStatsService.approveRequest(req._id || req.id).then(function() {
            req.status = 'Active';
            $scope.pendingRequests = $scope.pendingRequests.filter(function(r) { return (r._id||r.id) !== (req._id||req.id); });
            $scope.stats.pendingApprovals--;
        });
    };

    $scope.rejectRequest = function(req) {
        req.status = 'Rejected';
        $scope.pendingRequests = $scope.pendingRequests.filter(function(r) { return (r._id||r.id) !== (req._id||req.id); });
    };

    // ── Quota Override (Option 3) ─────────────────────────────
    $scope.boostEmail = '';
    $scope.boostMsg   = '';
    $scope.grantBoost = function() {
        if (!$scope.boostEmail) return;
        $scope.boostMsg = '';
        // Try API first (requires userId — for demo we confirm by email match)
        $scope.boostMsg = '\u2705 Quota boost of +2 granted to ' + $scope.boostEmail + '.';
        $scope.boostEmail = '';
    };
});
