var app = angular.module('labTrackApp', ['ngAnimate']);

/* â”€â”€ Shared localStorage helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ltGet(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch(e) { return fallback; }
}
function ltSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SERVICES
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* â”€â”€ SERVICE 1: AdminStatsService â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Used by: AdminDashboardController, ReportsController,
            MaintenanceController, EquipmentMgmtController
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.service('AdminStatsService', function() {

    // Function 1 â€” Returns the main admin statistics object
    this.getStats = function() {
        return {
            totalEquipment: 1248,
            activeBookings: 342,
            overdueReturns: 18,
            damagedItems:   7,
            uptime:         94,
            openLogs:       5
        };
    };

    // Function 2 â€” Returns pending student booking requests from localStorage
    this.getPendingRequests = function() {
        var all = ltGet('lt_bookings', []);
        return all.filter(function(b) { return b.status === 'Pending'; });
    };

    // Function 3 â€” Approves a booking by updating its status in localStorage
    this.approveRequest = function(bookingId) {
        var all = ltGet('lt_bookings', []);
        all.forEach(function(b) { if (b.id === bookingId) b.status = 'Active'; });
        ltSet('lt_bookings', all);
    };

});

/* â”€â”€ SERVICE 2: StudentService â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Used by: StudentMgmtController, AdminDashboardController
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.service('StudentService', function() {

    // Function 1 â€” Returns all students from localStorage
    this.getAllStudents = function() {
        return ltGet('lt_students_added', []);
    };

    // Function 2 â€” Adds a new student and saves to localStorage
    this.addStudent = function(studentObj) {
        var list = this.getAllStudents();
        studentObj.status  = 'Clear';
        studentObj.addedOn = new Date().toLocaleDateString('en-GB');
        list.push(studentObj);
        ltSet('lt_students_added', list);
        return 'Student "' + studentObj.name + '" (ID: ' + studentObj.id + ') added successfully!';
    };

    // Function 3 â€” Updates a student's status (Restricted / Clear)
    this.updateStatus = function(studentId, newStatus) {
        var list = this.getAllStudents();
        list.forEach(function(s) { if (s.id === studentId) s.status = newStatus; });
        ltSet('lt_students_added', list);
    };

});

/* â”€â”€ SERVICE 3: AuthService â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Used by: AuthController, DashboardController, CatalogController
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.service('AuthService', function() {

    // Function 1 â€” Validates credentials and saves session to localStorage
    this.login = function(email, password) {
        var ADMIN_EMAIL = 'admin@lab.com';
        var ADMIN_PASS  = 'Admin@123';
        var role, name;
        if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            role = 'admin'; name = 'Lab Administrator';
        } else if (email && password && password.length >= 6) {
            role = 'student';
            name = email.split('@')[0]
                        .replace(/[._\-]/g, ' ')
                        .replace(/\b\w/g, function(c) { return c.toUpperCase(); });
        } else {
            return null;
        }
        ltSet('labtrack_session', { role: role, name: name, email: email });
        return role;
    };

    // Function 2 â€” Returns the currently logged-in user's session object
    this.getSession = function() {
        return ltGet('labtrack_session', null);
    };

    // Function 3 â€” Registers a new student account and creates a session
    this.register = function(name, email, password, confirmPassword) {
        if (password !== confirmPassword) {
            return { success: false, error: 'Passwords do not match.' };
        }
        if (!password || password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters.' };
        }
        ltSet('labtrack_session', { role: 'student', name: name, email: email });
        return { success: true };
    };

});

/* â”€â”€ SERVICE 4: EquipmentService â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Used by: CatalogController, DashboardController
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.service('EquipmentService', function() {

    var baseList = [
        { name: 'Oscilloscope',               description: 'High-precision mixed domain oscilloscope for electronics labs.', category: 'electronics', categoryDisplay: 'Electronics',   image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400', available: 24, total: 40, statusBadge: 'badge-active'  },
        { name: 'Arduino UNO',                description: 'Microcontroller board for prototyping and embedded projects.',   category: 'electronics', categoryDisplay: 'Electronics',   image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400', available: 18, total: 30, statusBadge: 'badge-active'  },
        { name: 'Raspberry Pi 4',             description: 'Single-board computer for IoT and computing experiments.',       category: 'electronics', categoryDisplay: 'Electronics',   image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', available: 8,  total: 20, statusBadge: 'badge-pending' },
        { name: 'Digital Multimeter',         description: 'Accurate voltage, current, and resistance measurements.',        category: 'electronics', categoryDisplay: 'Electronics',   image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', available: 15, total: 25, statusBadge: 'badge-active'  },
        { name: 'Leica DMi8 Microscope',      description: 'Inverted microscope for advanced biological imaging.',           category: 'microscope',  categoryDisplay: 'Microscopes',   image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400', available: 3,  total: 5,  statusBadge: 'badge-active'  },
        { name: 'Thermo Fisher Spectrometer', description: 'UV-Vis spectrometer for chemical analysis.',                    category: 'microscope',  categoryDisplay: 'Spectrometers', image: 'https://images.unsplash.com/photo-1532187863486-abf9db3851ce?w=400', available: 0,  total: 1,  statusBadge: 'badge-pending' }
    ];

    // Function 1 â€” Returns full equipment list (base + admin-added)
    this.getAll = function() {
        var extra = ltGet('lt_equipment_added', []);
        return baseList.concat(extra.map(function(e) {
            return {
                name: e.name,
                description: 'Added by ' + e.addedBy + ' Â· ' + e.location,
                category: 'electronics', categoryDisplay: 'Electronics',
                image: baseList[0].image, available: 1, total: 1, statusBadge: 'badge-active'
            };
        }));
    };

    // Function 2 â€” Returns equipment filtered by category
    this.getByCategory = function(cat) {
        if (!cat) return this.getAll();
        return this.getAll().filter(function(e) { return e.category === cat; });
    };

    // Function 3 â€” Creates a booking entry and saves to localStorage
    this.bookItem = function(item) {
        var bookings = ltGet('lt_bookings', []);
        var today = new Date();
        var ret   = new Date(); ret.setDate(ret.getDate() + 7);
        bookings.push({
            id:       'BK-' + Date.now(),
            name:     item.name,
            image:    item.image,
            status:   'Pending',
            bookedOn: today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            returnBy: ret.toLocaleDateString('en-GB',   { day: '2-digit', month: 'short', year: 'numeric' })
        });
        ltSet('lt_bookings', bookings);
        return item.name + ' booking request submitted! Check My Bookings.';
    };

});

/* â”€â”€ SERVICE 5: BookingService â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Used by: MyBookingsController, BundleController
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.service('BookingService', function() {

    var DEFAULTS = [
        { id: 'BK-001', name: 'Oscilloscope',      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200', status: 'Active',    bookedOn: '06 May 2024', returnBy: '13 May 2024' },
        { id: 'BK-002', name: 'Arduino UNO',       image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=200', status: 'Pending',   bookedOn: '07 May 2024', returnBy: '14 May 2024' },
        { id: 'BK-003', name: 'Raspberry Pi 4',    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200', status: 'Completed', bookedOn: '05 May 2024', returnBy: '12 May 2024' },
        { id: 'BK-004', name: 'Digital Multimeter', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200', status: 'Overdue',   bookedOn: '01 May 2024', returnBy: '08 May 2024' }
    ];

    // Function 1 â€” Returns all bookings (localStorage + default samples merged)
    this.getAll = function() {
        var stored = ltGet('lt_bookings', []);
        var ids    = stored.map(function(b) { return b.id; });
        return stored.concat(DEFAULTS.filter(function(d) { return ids.indexOf(d.id) < 0; }));
    };

    // Function 2 â€” Adds a new booking and saves to localStorage
    this.addBooking = function(name, image, days) {
        var list  = ltGet('lt_bookings', []);
        var today = new Date();
        var ret   = new Date(); ret.setDate(ret.getDate() + (days || 7));
        list.push({
            id:       'BK-' + Date.now(),
            name:     name,
            image:    image,
            status:   'Pending',
            bookedOn: today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            returnBy: ret.toLocaleDateString('en-GB',   { day: '2-digit', month: 'short', year: 'numeric' })
        });
        ltSet('lt_bookings', list);
        return '"' + name + '" booking submitted successfully!';
    };

    // Function 3 â€” Updates a booking's status in localStorage
    this.updateStatus = function(bookingId, newStatus) {
        var list = ltGet('lt_bookings', []);
        list.forEach(function(b) { if (b.id === bookingId) b.status = newStatus; });
        ltSet('lt_bookings', list);
    };

});

/* â”€â”€ SERVICE 6: UserProfileService â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Used by: ProfileController
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.service('UserProfileService', function() {

    // Function 1 â€” Returns current user's profile built from session
    this.getProfile = function() {
        var session = ltGet('labtrack_session', null);
        var name    = session ? session.name  : 'Student';
        var email   = session ? session.email : 'student@university.edu';
        return {
            fullName:      name,
            preferredName: name.split(' ')[0],
            city:          'Chennai',
            address:       'Campus Road Block A',
            uniEmail:      email,
            department:    'Biomedical Engineering',
            title:         (session && session.role === 'admin') ? 'Lab Administrator' : 'Graduate Researcher',
            status:        'Active',
            joinDate:      'Sep 2022'
        };
    };

    // Function 2 â€” Returns a generated avatar URL based on the user's name
    this.getAvatarUrl = function(name) {
        return 'https://ui-avatars.com/api/?name=' +
               encodeURIComponent(name || 'Student') +
               '&background=006d77&color=fff&size=128&bold=true';
    };

    // Function 3 â€” Saves user settings/preferences to localStorage
    this.saveSettings = function(settingsObj) {
        ltSet('lt_user_settings', settingsObj);
        return 'Settings saved successfully!';
    };

});

/* â”€â”€ SERVICE 7: NotificationService â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Used by: NotificationsController
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.service('NotificationService', function() {

    var notifList = [
        { id: 1, title: 'Booking Approved',        time: 'Just now',     icon: 'OK',   iconBg: '#d1fae5', iconColor: '#059669', message: 'Your request for the Olympus CX23 Microscope has been approved for tomorrow, 10:00 AM - 12:00 PM.', link: 'my-bookings.html', read: false, archived: false },
        { id: 2, title: 'Return Reminder',         time: '2 hours ago',  icon: '!',    iconBg: '#fee2e2', iconColor: '#dc2626', message: 'The Eppendorf Centrifuge 5424 is due for return in 30 minutes. Please ensure it is cleaned before returning.', link: '', read: false, archived: false },
        { id: 3, title: 'Lab Maintenance Notice',  time: 'Yesterday',    icon: 'Info', iconBg: '#dbeafe', iconColor: '#2563eb', message: 'Lab 3B will be closed for routine HVAC maintenance this Friday from 8:00 AM to 2:00 PM.', link: '', read: true, archived: false },
        { id: 4, title: 'New Equipment Available', time: 'Oct 24, 2023', icon: 'New',  iconBg: '#e5e7eb', iconColor: '#6b7280', message: 'Two new Thermo Fisher Spectrophotometers have been added to the inventory and are now available for booking.', link: '', read: true, archived: false }
    ];

    // Function 1 â€” Returns notifications filtered by type (all/unread/archived)
    this.getFiltered = function(filter) {
        if (filter === 'unread')   return notifList.filter(function(n) { return !n.read && !n.archived; });
        if (filter === 'archived') return notifList.filter(function(n) { return n.archived; });
        return notifList.filter(function(n) { return !n.archived; });
    };

    // Function 2 â€” Marks a single notification as read by ID
    this.markRead = function(notifId) {
        notifList.forEach(function(n) { if (n.id === notifId) n.read = true; });
    };

    // Function 3 â€” Archives a notification by ID
    this.archive = function(notifId) {
        notifList.forEach(function(n) { if (n.id === notifId) n.archived = true; });
    };

    // Function 4 â€” Returns total unread notification count
    this.getUnreadCount = function() {
        return notifList.filter(function(n) { return !n.read && !n.archived; }).length;
    };

});


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FACTORIES
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* â”€â”€ FACTORY 1: EquipmentFactory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.factory('EquipmentFactory', function() {

    var BASE_KEY = 'lt_equipment_added';

    var baseList = [
        { id: 'EQ-001', name: 'Leica DMi8 Microscope',      category: 'Microscopes',   status: 'Available',   units: 5, available: 3,  lastMaintained: 'Oct 12, 2023' },
        { id: 'EQ-042', name: 'Beckman Coulter Centrifuge',  category: 'Centrifuges',   status: 'In Use',      units: 2, available: 0,  lastMaintained: 'Sep 05, 2023' },
        { id: 'EQ-118', name: 'Thermo Fisher Spectrometer',  category: 'Spectrometers', status: 'Maintenance', units: 1, available: 0,  lastMaintained: 'Nov 20, 2022' }
    ];

    function readAdded() {
        var raw = localStorage.getItem(BASE_KEY);
        return raw ? JSON.parse(raw) : [];
    }

    function saveAdded(list) {
        localStorage.setItem(BASE_KEY, JSON.stringify(list));
    }

    return {

        // Function 1 â€” Returns full equipment list (base static + admin-added)
        getAll: function() {
            var added = readAdded();
            return baseList.concat(added.map(function(e) {
                return {
                    id:            'EQ-NEW',
                    name:          e.name,
                    category:      'Electronics',
                    status:        'Available',
                    units:         1,
                    available:     1,
                    lastMaintained:'Just Added'
                };
            }));
        },

        // Function 2 â€” Adds new equipment and saves to localStorage (ADD)
        addEquipment: function(obj) {
            var list = readAdded();
            obj.id      = 'EQ-' + Date.now();
            obj.status  = 'Available';
            obj.addedOn = new Date().toLocaleDateString('en-GB');
            list.push(obj);
            saveAdded(list);
            return 'Equipment "' + obj.name + '" added successfully to inventory!';
        },

        // Function 3 â€” Removes equipment from localStorage by ID (DELETE)
        deleteEquipment: function(id) {
            var list = readAdded().filter(function(e) { return e.id !== id; });
            saveAdded(list);
            return 'Equipment removed from inventory.';
        },

        // Function 4 â€” Updates equipment status by ID (UPDATE)
        updateEquipmentStatus: function(id, status) {
            var list = readAdded();
            list.forEach(function(e) { if (e.id === id) e.status = status; });
            saveAdded(list);
        }

    };
});

/* â”€â”€ FACTORY 2: StudentFactory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.factory('StudentFactory', function() {

    var KEY = 'lt_students_added';

    function readAll() {
        var raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    }

    function saveAll(list) {
        localStorage.setItem(KEY, JSON.stringify(list));
    }

    return {

        // Function 1 â€” Returns all student records from localStorage (READ)
        getAll: function() {
            return readAll();
        },

        // Function 2 â€” Adds a new student and saves to localStorage (ADD)
        addStudent: function(obj) {
            var list   = readAll();
            obj.status  = 'Clear';
            obj.addedOn = new Date().toLocaleDateString('en-GB');
            list.push(obj);
            saveAll(list);
            return 'Student "' + obj.name + '" (ID: ' + obj.id + ') added successfully!';
        },

        // Function 3 â€” Permanently removes a student record by ID (DELETE)
        deleteStudent: function(id) {
            var list = readAll().filter(function(s) { return s.id !== id; });
            saveAll(list);
            return 'Student record removed.';
        },

        // Function 4 â€” Updates student clearance status by ID (UPDATE)
        updateStudentStatus: function(id, status) {
            var list = readAll();
            list.forEach(function(s) { if (s.id === id) s.status = status; });
            saveAll(list);
        }

    };
});

/* â”€â”€ FACTORY 3: SessionFactory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.factory('SessionFactory', function() {

    var KEY = 'labtrack_session';

    return {

        // Function 1 â€” Creates and saves a new login session (ADD)
        createSession: function(name, email, role) {
            var session = { name: name, email: email, role: role };
            localStorage.setItem(KEY, JSON.stringify(session));
            return session;
        },

        // Function 2 â€” Returns the current session object (READ)
        getSession: function() {
            var raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : null;
        },

        // Function 3 â€” Destroys the session on logout (DELETE)
        clearSession: function() {
            localStorage.removeItem(KEY);
        },

        // Function 4 â€” Updates the display name in the existing session (UPDATE)
        updateSessionName: function(newName) {
            var raw = localStorage.getItem(KEY);
            if (raw) {
                var session  = JSON.parse(raw);
                session.name = newName;
                localStorage.setItem(KEY, JSON.stringify(session));
            }
        }

    };
});

/* â”€â”€ FACTORY 4: BookingFactory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.factory('BookingFactory', function() {

    var KEY = 'lt_bookings';

    var DEFAULTS = [
        { id: 'BK-001', name: 'Oscilloscope',       image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200', status: 'Active',    bookedOn: '06 May 2024', returnBy: '13 May 2024' },
        { id: 'BK-002', name: 'Arduino UNO',        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=200', status: 'Pending',   bookedOn: '07 May 2024', returnBy: '14 May 2024' },
        { id: 'BK-003', name: 'Raspberry Pi 4',     image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200', status: 'Completed', bookedOn: '05 May 2024', returnBy: '12 May 2024' },
        { id: 'BK-004', name: 'Digital Multimeter', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200', status: 'Overdue',   bookedOn: '01 May 2024', returnBy: '08 May 2024' }
    ];

    function readStored() {
        var raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    }

    function saveStored(list) {
        localStorage.setItem(KEY, JSON.stringify(list));
    }

    return {

        // Function 1 â€” Returns all bookings (localStorage + default samples) READ
        getAll: function() {
            var stored = readStored();
            var ids    = stored.map(function(b) { return b.id; });
            return stored.concat(DEFAULTS.filter(function(d) {
                return ids.indexOf(d.id) < 0;
            }));
        },

        // Function 2 â€” Returns only Pending bookings READ/FILTER
        getPending: function() {
            return this.getAll().filter(function(b) { return b.status === 'Pending'; });
        },

        // Function 3 â€” Creates a new booking and saves to localStorage ADD
        addBooking: function(name, image, days) {
            var list  = readStored();
            var today = new Date();
            var ret   = new Date(); ret.setDate(ret.getDate() + (days || 7));
            list.push({
                id:       'BK-' + Date.now(),
                name:     name,
                image:    image,
                status:   'Pending',
                bookedOn: today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                returnBy: ret.toLocaleDateString('en-GB',   { day: '2-digit', month: 'short', year: 'numeric' })
            });
            saveStored(list);
            return '"' + name + '" booking submitted successfully!';
        },

        // Function 4 â€” Permanently removes a booking by ID DELETE
        deleteBooking: function(id) {
            var list = readStored().filter(function(b) { return b.id !== id; });
            saveStored(list);
        },

        // Function 5 â€” Updates a booking's status by ID UPDATE
        updateBookingStatus: function(id, status) {
            var list = readStored();
            list.forEach(function(b) { if (b.id === id) b.status = status; });
            saveStored(list);
        }

    };
});

/* â”€â”€ FACTORY 5: NotificationFactory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.factory('NotificationFactory', function() {

    var notifData = [
        { id: 1, title: 'Booking Approved',        time: 'Just now',     icon: 'OK',   iconBg: '#d1fae5', iconColor: '#059669', message: 'Your request for the Olympus CX23 Microscope has been approved for tomorrow, 10:00 AM - 12:00 PM.', link: 'my-bookings.html', read: false, archived: false },
        { id: 2, title: 'Return Reminder',         time: '2 hours ago',  icon: '!',    iconBg: '#fee2e2', iconColor: '#dc2626', message: 'The Eppendorf Centrifuge 5424 is due for return in 30 minutes. Please ensure it is cleaned before returning.',  link: '',               read: false, archived: false },
        { id: 3, title: 'Lab Maintenance Notice',  time: 'Yesterday',    icon: 'Info', iconBg: '#dbeafe', iconColor: '#2563eb', message: 'Lab 3B will be closed for routine HVAC maintenance this Friday from 8:00 AM to 2:00 PM.',                   link: '',               read: true,  archived: false },
        { id: 4, title: 'New Equipment Available', time: 'Oct 24, 2023', icon: 'New',  iconBg: '#e5e7eb', iconColor: '#6b7280', message: 'Two new Thermo Fisher Spectrophotometers have been added to the inventory and are now available for booking.', link: '',               read: true,  archived: false }
    ];

    var nextId = 5;

    return {

        // Function 1 â€” Returns notifications filtered by tab type READ
        getFiltered: function(filter) {
            if (filter === 'unread')   return notifData.filter(function(n) { return !n.read && !n.archived; });
            if (filter === 'archived') return notifData.filter(function(n) { return n.archived; });
            return notifData.filter(function(n) { return !n.archived; });
        },

        // Function 2 â€” Adds a new notification entry ADD
        addNotification: function(title, message, icon, iconBg, iconColor) {
            notifData.unshift({
                id:        nextId++,
                title:     title,
                message:   message,
                icon:      icon      || 'i',
                iconBg:    iconBg    || '#e5e7eb',
                iconColor: iconColor || '#6b7280',
                time:      'Just now',
                link:      '',
                read:      false,
                archived:  false
            });
        },

        // Function 3 â€” Permanently removes a notification by ID DELETE
        deleteNotification: function(id) {
            for (var i = 0; i < notifData.length; i++) {
                if (notifData[i].id === id) { notifData.splice(i, 1); break; }
            }
        },

        // Function 4 â€” Updates any property on a notification by ID UPDATE
        updateNotification: function(id, changes) {
            notifData.forEach(function(n) {
                if (n.id === id) {
                    Object.keys(changes).forEach(function(k) { n[k] = changes[k]; });
                }
            });
        },

        // Helper â€” Returns total unread count for badge
        getUnreadCount: function() {
            return notifData.filter(function(n) { return !n.read && !n.archived; }).length;
        }

    };
});


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CONTROLLERS  (all use DI â€” services injected as parameters)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* â”€â”€ Auth / Login & Register â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Injects: AuthService
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('AuthController', function($scope, AuthService) {
    $scope.user            = { email: '', password: '' };
    $scope.register        = { name: '', email: '', password: '', confirmPassword: '' };
    $scope.loginError      = '';
    $scope.registerError   = '';

    // Login â€” delegates to AuthService.login()
    $scope.doLogin = function() {
        var role = AuthService.login($scope.user.email, $scope.user.password);
        if (role === 'admin')        window.location.href = 'admin-dashboard.html';
        else if (role === 'student') window.location.href = 'student-dashboard.html';
        else                         $scope.loginError = 'Invalid email or password.';
    };

    // Register â€” delegates to AuthService.register()
    $scope.doRegister = function() {
        var result = AuthService.register(
            $scope.register.name,
            $scope.register.email,
            $scope.register.password,
            $scope.register.confirmPassword
        );
        if (result.success) window.location.href = 'student-dashboard.html';
        else                $scope.registerError = result.error;
    };
});

/* â”€â”€ Profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Injects: UserProfileService
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('ProfileController', function($scope, UserProfileService) {
    // UserProfileService.getProfile() â€” Function 1
    $scope.user      = UserProfileService.getProfile();
    // UserProfileService.getAvatarUrl() â€” Function 2
    $scope.avatarUrl = UserProfileService.getAvatarUrl($scope.user.fullName);
    $scope.settings  = { emailAlerts: true, smsAlerts: false, theme: 'light' };
    $scope.saveMsg   = '';

    // UserProfileService.saveSettings() â€” Function 3
    $scope.saveSettings = function() {
        $scope.saveMsg = UserProfileService.saveSettings($scope.settings);
    };
});

/* â”€â”€ Equipment Catalog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Injects: EquipmentService, AuthService
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('CatalogController', function($scope, EquipmentService, AuthService) {
    $scope.searchQuery = '';
    $scope.filters     = { category: '', department: '', availability: '' };
    $scope.bookedMsg   = '';

    // EquipmentService.getAll() â€” Function 1
    $scope.equipmentList = EquipmentService.getAll();

    // EquipmentService.getByCategory() â€” Function 2
    $scope.applyFilter = function() {
        $scope.equipmentList = EquipmentService.getByCategory($scope.filters.category);
    };

    // EquipmentService.bookItem() — Function 3
    $scope.bookItem = function(item) {
        EquipmentService.bookItem(item);
        item._booked = true;
    };
});

/* â”€â”€ Student Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Injects: AuthService, EquipmentService
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('DashboardController', function($scope, AuthService, EquipmentService) {
    // AuthService.getSession() â€” Function 2
    var session        = AuthService.getSession();
    $scope.currentUser = { name: session ? session.name : 'Student' };

    // EquipmentService.getAll() â€” Function 1 (for total count)
    $scope.stats = {
        activeBookings:  3,
        pendingApprovals:2,
        totalEquipment:  EquipmentService.getAll().length,
        utilization:     '68%'
    };
});

/* â”€â”€ My Bookings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Injects: BookingService
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('MyBookingsController', function($scope, BookingService) {
    $scope.searchQuery = '';
    $scope.activeTab   = 'all';
    $scope.message     = '';

    // BookingService.getAll() â€” Function 1
    $scope.bookings = BookingService.getAll();

    $scope.setTab = function(tab) { $scope.activeTab = tab; };

    $scope.countByStatus = function(s) {
        return $scope.bookings.filter(function(b) { return b.status === s; }).length;
    };

    $scope.filteredBookings = function() {
        if ($scope.activeTab === 'all') return $scope.bookings;
        var map = { active: 'Active', pending: 'Pending', completed: 'Completed', overdue: 'Overdue' };
        var s   = map[$scope.activeTab];
        return $scope.bookings.filter(function(b) { return b.status === s; });
    };

    // BookingService.updateStatus() â€” Function 3
    $scope.returnItem = function(b) {
        BookingService.updateStatus(b.id, 'Completed');
        b.status       = 'Completed';
        $scope.message = b.name + ' returned successfully.';
    };

    $scope.extendItem = function(b) {
        b.extended    = true;
        b.extendDays  = (b.extendDays || 0) + 7;
        var d = new Date(); d.setDate(d.getDate() + b.extendDays);
        b.newReturnBy = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        $scope.message = b.name + ' extended by 7 days.';
    };

    $scope.cancelItem = function(b) {
        if (confirm('Cancel booking for ' + b.name + '?')) {
            BookingService.updateStatus(b.id, 'Completed');
            b.status       = 'Completed';
            $scope.message = 'Booking for ' + b.name + ' cancelled.';
        }
    };
});

/* â”€â”€ Bundle Booking â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Injects: BookingService
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('BundleController', function($scope, BookingService) {
    $scope.searchQuery    = '';
    $scope.deptFilter     = '';
    $scope.bookingSuccess = '';

    $scope.bundles = [
        { name: 'Electronics Lab Starter Kit', description: 'Complete set for introductory electronics and circuit experiments.', dept: 'Electronics', stock: 'Available', demand: 'High Demand', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600', items: ['Arduino UNO R3', 'Breadboard & Jumper Wires', 'Digital Multimeter', 'Oscilloscope (1 unit)', 'Power Supply 5V'] },
        { name: 'Optics Experiment Set',        description: 'Lenses, laser source, and measurement tools for wave optics experiments.',    dept: 'Physics',      stock: 'Low Stock',  demand: '',           image: 'https://images.unsplash.com/photo-1532187863486-abf9db3851ce?w=600', items: ['He-Ne Laser Source', 'Optical Bench', 'Lens Set (6 pcs)', 'Screen & Ruler'] },
        { name: 'Biomedical Signal Kit',        description: 'Tools for measuring and analysing biomedical signals and responses.',         dept: 'Electronics',  stock: 'Available',  demand: '',           image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600', items: ['ECG Electrodes', 'Signal Amplifier', 'Data Logger', 'Oscilloscope'] }
    ];

    // BookingService.addBooking() â€” Function 2
    $scope.bookBundle = function(bundle) {
        BookingService.addBooking(bundle.name, bundle.image, 14);
        $scope.bookingSuccess = bundle.name;
    };

    $scope.showInfo = function(bundle) {
        alert(bundle.name + '\n\nContents:\n' + bundle.items.join('\n'));
    };
});

/* â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Injects: NotificationService
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('NotificationsController', function($scope, NotificationService) {
    $scope.searchQuery = '';
    $scope.notifFilter = 'all';

    // NotificationService.getFiltered() â€” Function 1
    $scope.notifications = NotificationService.getFiltered('all');

    $scope.countUnread = function() {
        return NotificationService.getUnreadCount();
    };

    $scope.countArchived = function() {
        return NotificationService.getFiltered('archived').length;
    };

    $scope.changeFilter = function(f) {
        $scope.notifFilter   = f;
        // NotificationService.getFiltered() â€” Function 1
        $scope.notifications = NotificationService.getFiltered(f);
    };

    // Backward-compat alias used in HTML
    $scope.filteredNotifications = function() {
        return NotificationService.getFiltered($scope.notifFilter);
    };

    // NotificationService.markRead() â€” Function 2
    $scope.markRead = function(n) {
        NotificationService.markRead(n.id);
        n.read = true;
    };

    // NotificationService.archive() â€” Function 3
    $scope.archiveNotif = function(n) {
        NotificationService.archive(n.id);
        $scope.notifications = NotificationService.getFiltered($scope.notifFilter);
    };

    $scope.markAllRead = function() {
        $scope.notifications.forEach(function(n) {
            NotificationService.markRead(n.id);
            n.read = true;
        });
    };

    $scope.loadMore = function() { alert('No more notifications to load.'); };
});

/* â”€â”€ Calendar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   No service needed â€” simple UI state only
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('CalendarController', function($scope) {
    $scope.calendar = { month: 'August', year: '2026', selectedDate: 'August 14, 2026' };
});

/* â”€â”€ Maintenance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Injects: AdminStatsService
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('MaintenanceController', function($scope, AdminStatsService) {
    $scope.maintenance = { status: 'Broken', equipmentId: 'EQ-1004' };

    // AdminStatsService.getStats() â€” Function 1
    var s        = AdminStatsService.getStats();
    $scope.stats = { uptime: s.uptime, openLogs: s.openLogs };

    $scope.damageReport = { equipment: '', reportedBy: '', location: '' };
});

/* â”€â”€ Reports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Injects: AdminStatsService
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('ReportsController', function($scope, AdminStatsService) {
    // AdminStatsService.getStats() â€” Function 1 (shared from Dashboard)
    var s = AdminStatsService.getStats();
    $scope.stats = {
        totalBookings:     '1,248',
        activeEquipment:   s.activeBookings,
        maintenanceAlerts: s.overdueReturns,
        uniqueUsers:       89
    };
});

/* â”€â”€ Student Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Injects: StudentService
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('StudentMgmtController', function($scope, StudentService) {
    $scope.searchQuery = '';
    $scope.filters     = { department: '', status: '' };
    $scope.newStudent  = { name: '', id: '', department: '' };
    $scope.submitMsg   = '';

    // StudentService.getAllStudents() â€” Function 1
    $scope.addedStudents = StudentService.getAllStudents();

    // StudentService.addStudent() â€” Function 2
    $scope.submitAddStudent = function() {
        if (!$scope.newStudent.name || !$scope.newStudent.id || !$scope.newStudent.department) return;
        $scope.submitMsg     = StudentService.addStudent(angular.copy($scope.newStudent));
        $scope.addedStudents = StudentService.getAllStudents();
        $scope.newStudent    = { name: '', id: '', department: '' };
        var modal = document.getElementById('addStudentModal');
        if (modal) modal.classList.remove('open');
    };

    // StudentService.updateStatus() â€” Function 3
    $scope.restrictStudent = function(studentId) {
        StudentService.updateStatus(studentId, 'Restricted');
        $scope.addedStudents = StudentService.getAllStudents();
    };
});

/* â”€â”€ Equipment Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Injects: AdminStatsService
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('EquipmentMgmtController', function($scope, AdminStatsService) {
    $scope.searchQuery    = '';
    $scope.filters        = { category: '', status: '' };
    $scope.newEquipment   = { name: '', addedBy: '', location: '' };
    $scope.submitMsg      = '';
    $scope.addedEquipment = ltGet('lt_equipment_added', []);

    // AdminStatsService.getStats() â€” Function 1 (total count)
    $scope.totalCount = AdminStatsService.getStats().totalEquipment;

    $scope.submitAddEquipment = function() {
        if (!$scope.newEquipment.name || !$scope.newEquipment.addedBy || !$scope.newEquipment.location) return;
        var e = angular.copy($scope.newEquipment);
        $scope.addedEquipment.push(e);
        ltSet('lt_equipment_added', $scope.addedEquipment);
        $scope.submitMsg    = 'Equipment "' + e.name + '" added successfully to inventory!';
        $scope.newEquipment = { name: '', addedBy: '', location: '' };
        var modal = document.getElementById('addEquipModal');
        if (modal) modal.classList.remove('open');
    };
});

/* â”€â”€ Admin Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Injects: AdminStatsService, StudentService
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
app.controller('AdminDashboardController', function($scope, AdminStatsService, StudentService) {
    var session        = window.LabTrackAuth ? window.LabTrackAuth.getSession() : null;
    $scope.currentUser = { name: session ? session.name : 'Admin' };

    // AdminStatsService.getStats() â€” Function 1
    var s        = AdminStatsService.getStats();
    $scope.stats = {
        activeBookings:  s.activeBookings,
        pendingApprovals:AdminStatsService.getPendingRequests().length,
        totalEquipment:  s.totalEquipment,
        utilization:     '68%'
    };

    // AdminStatsService.getPendingRequests() â€” Function 2
    $scope.pendingRequests = AdminStatsService.getPendingRequests();

    // AdminStatsService.approveRequest() â€” Function 3
    $scope.approveRequest = function(req) {
        AdminStatsService.approveRequest(req.id);
        req.status         = 'Active';
        $scope.pendingRequests = $scope.pendingRequests.filter(function(r) { return r.id !== req.id; });
    };

    $scope.rejectRequest = function(req) {
        req.status = 'Completed';
        var all = ltGet('lt_bookings', []);
        all.forEach(function(b) { if (b.id === req.id) b.status = 'Completed'; });
        ltSet('lt_bookings', all);
        $scope.pendingRequests = $scope.pendingRequests.filter(function(r) { return r.id !== req.id; });
    };

    // StudentService.getAllStudents() â€” Function 1
    $scope.recentStudents = StudentService.getAllStudents().slice(0, 3);
});
