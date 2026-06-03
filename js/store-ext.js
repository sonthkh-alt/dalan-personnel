/* ----------------------------------------------------
   DẠ LAN SUITE v4.0 — DATA STORE EXTENSION
   Adds: Floor/Tables (POS), Events/Banquet, Shifts/Attendance,
   plus cross-module analytics. Augments DaLanStore without
   touching the original store.js (zero-risk extension).
------------------------------------------------------- */

(function () {
    "use strict";

    // Today anchor (real device date). Helpers to build relative dates for mock data.
    const TODAY = new Date();
    const iso = (d) => d.toISOString().substring(0, 10);
    const addDays = (n) => { const d = new Date(TODAY); d.setDate(d.getDate() + n); return iso(d); };

    Object.assign(DaLanStore, {

        // ===================================================
        // SHIFT DEFINITIONS (ca làm việc chuẩn F&B)
        // ===================================================
        SHIFT_TYPES: [
            { key: "Sáng",      label: "Ca Sáng",      start: "06:00", end: "14:00", color: "#FF9500", hours: 8 },
            { key: "Chiều",     label: "Ca Chiều",     start: "14:00", end: "22:00", color: "#007AFF", hours: 8 },
            { key: "Tối",       label: "Ca Tối",       start: "17:00", end: "23:30", color: "#5856D6", hours: 6.5 },
            { key: "Hành chính",label: "Hành chính",   start: "08:00", end: "17:00", color: "#34C759", hours: 8 }
        ],

        EVENT_TYPES: [
            { key: "Tiệc cưới", emoji: "💍", color: "#C62828" },
            { key: "Hội nghị",  emoji: "🎤", color: "#007AFF" },
            { key: "Gala",      emoji: "🎉", color: "#5856D6" },
            { key: "Sinh nhật", emoji: "🎂", color: "#FF9500" },
            { key: "Liên hoan", emoji: "🍻", color: "#34C759" },
            { key: "Khác",      emoji: "📌", color: "#8E8E93" }
        ],

        TABLE_ZONES: ["Tầng trệt", "Tầng lửng", "Sân vườn", "Phòng VIP"],

        // ===================================================
        // MOCK DATA — TABLES (Sơ đồ bàn)
        // ===================================================
        MOCK_TABLES: [
            // Dạ Lan Center — Tầng trệt
            { id: "T-01", name: "Bàn 01", unit: "Dạ Lan Center", zone: "Tầng trệt", seats: 4, status: "available", currentOrderId: null },
            { id: "T-02", name: "Bàn 02", unit: "Dạ Lan Center", zone: "Tầng trệt", seats: 4, status: "occupied",  currentOrderId: null },
            { id: "T-03", name: "Bàn 03", unit: "Dạ Lan Center", zone: "Tầng trệt", seats: 6, status: "occupied",  currentOrderId: "ORD-001" },
            { id: "T-04", name: "Bàn 04", unit: "Dạ Lan Center", zone: "Tầng trệt", seats: 2, status: "reserved",  currentOrderId: null },
            { id: "T-05", name: "Bàn 05", unit: "Dạ Lan Center", zone: "Tầng trệt", seats: 4, status: "cleaning",  currentOrderId: null },
            { id: "T-06", name: "Bàn 06", unit: "Dạ Lan Center", zone: "Sân vườn",  seats: 8, status: "available", currentOrderId: null },
            { id: "T-07", name: "Bàn 07", unit: "Dạ Lan Center", zone: "Sân vườn",  seats: 8, status: "available", currentOrderId: null },
            { id: "T-V1", name: "VIP 1",  unit: "Dạ Lan Center", zone: "Phòng VIP", seats: 12, status: "reserved", currentOrderId: null },
            { id: "T-V2", name: "VIP 2",  unit: "Dạ Lan Center", zone: "Phòng VIP", seats: 12, status: "available",currentOrderId: null },
            // Dạ Lan Star
            { id: "S-01", name: "Bar 01", unit: "Dạ Lan Star", zone: "Tầng trệt", seats: 2, status: "occupied",  currentOrderId: null },
            { id: "S-02", name: "Bar 02", unit: "Dạ Lan Star", zone: "Tầng trệt", seats: 2, status: "available", currentOrderId: null },
            { id: "S-03", name: "Lounge 1",unit: "Dạ Lan Star", zone: "Tầng lửng", seats: 6, status: "available", currentOrderId: null },
            { id: "S-04", name: "Lounge 2",unit: "Dạ Lan Star", zone: "Tầng lửng", seats: 6, status: "reserved",  currentOrderId: null }
        ],

        // ===================================================
        // MOCK DATA — EVENTS / BANQUET (Sự kiện & tiệc)
        // ===================================================
        MOCK_EVENTS: [
            {
                id: "EVT-001", title: "Tiệc cưới Anh Khôi & Chị Mai", type: "Tiệc cưới",
                unit: "Dạ Lan Center", hall: "Sảnh Hồng Ngọc", date: addDays(2), startTime: "18:00",
                guests: 400, tables: 40, status: "confirmed",
                contactName: "Trần Văn Khôi", contactPhone: "0905668899",
                budget: 520000000, deposit: 150000000,
                menuPackage: "Set Menu Vàng — 9 món", services: ["MC", "Ban nhạc", "Trang trí hoa tươi", "Màn LED"],
                notes: "Khách yêu cầu tông màu hồng - trắng, có múa mở màn."
            },
            {
                id: "EVT-002", title: "Gala Dinner Tập đoàn FPT", type: "Gala",
                unit: "Dạ Lan Event", hall: "Trung tâm Hội nghị", date: addDays(5), startTime: "17:30",
                guests: 600, tables: 60, status: "deposit",
                contactName: "Nguyễn Thị Lan (FPT)", contactPhone: "0912334455",
                budget: 850000000, deposit: 300000000,
                menuPackage: "Buffet cao cấp 50 món", services: ["Âm thanh - ánh sáng", "Sân khấu", "MC song ngữ", "Quay phim"],
                notes: "Sự kiện thường niên 600 khách, cần khu check-in riêng."
            },
            {
                id: "EVT-003", title: "Hội nghị khách hàng Ngân hàng ACB", type: "Hội nghị",
                unit: "Dạ Lan Event", hall: "Phòng Kim Cương", date: addDays(9), startTime: "08:00",
                guests: 200, tables: 0, status: "inquiry",
                contactName: "Phòng Marketing ACB", contactPhone: "0988112233",
                budget: 180000000, deposit: 0,
                menuPackage: "Tiệc trà + teabreak", services: ["Máy chiếu", "Bàn ghế hội nghị", "Teabreak 2 lần"],
                notes: "Đang chờ duyệt ngân sách, dự kiến chốt trong tuần."
            },
            {
                id: "EVT-004", title: "Sinh nhật bé Bảo An tròn 1 tuổi", type: "Sinh nhật",
                unit: "Dạ Lan Star", hall: "Lounge tầng lửng", date: addDays(-1), startTime: "10:00",
                guests: 50, tables: 6, status: "completed",
                contactName: "Chị Hồng", contactPhone: "0933445566",
                budget: 35000000, deposit: 35000000,
                menuPackage: "Set Menu Bạc — 7 món", services: ["Trang trí bóng", "Bánh kem 3 tầng"],
                notes: "Đã hoàn tất, khách hài lòng, để lại đánh giá 5 sao."
            },
            {
                id: "EVT-005", title: "Tiệc tất niên Công ty Dệt may Hòa Thọ", type: "Liên hoan",
                unit: "Dạ Lan Center", hall: "Sảnh Hồng Ngọc", date: addDays(14), startTime: "18:30",
                guests: 320, tables: 32, status: "confirmed",
                contactName: "Anh Dũng - HR", contactPhone: "0977665544",
                budget: 410000000, deposit: 120000000,
                menuPackage: "Set Menu Vàng — 9 món", services: ["Ban nhạc", "Bốc thăm trúng thưởng", "MC"],
                notes: "Có chương trình gala và rút thăm cuối tiệc."
            }
        ],

        // ===================================================
        // MOCK DATA — SHIFTS / ATTENDANCE (Xếp ca & chấm công)
        // ===================================================
        MOCK_SHIFTS: (function () {
            // Auto-generate a realistic week for service staff
            const today = new Date();
            const d0 = iso(today);
            const dP1 = (function(){ const d=new Date(today); d.setDate(d.getDate()-1); return d.toISOString().substring(0,10); })();
            const dN1 = (function(){ const d=new Date(today); d.setDate(d.getDate()+1); return d.toISOString().substring(0,10); })();
            return [
                { id: "SH-001", employeeId: "DL-009", date: d0, shift: "Sáng",   status: "present", checkIn: "05:54", checkOut: "14:03" },
                { id: "SH-002", employeeId: "DL-010", date: d0, shift: "Sáng",   status: "late",    checkIn: "06:21", checkOut: "14:00" },
                { id: "SH-003", employeeId: "DL-008", date: d0, shift: "Hành chính", status: "present", checkIn: "07:58", checkOut: "" },
                { id: "SH-004", employeeId: "DL-012", date: d0, shift: "Chiều",  status: "present", checkIn: "13:50", checkOut: "" },
                { id: "SH-005", employeeId: "DL-013", date: d0, shift: "Tối",    status: "scheduled", checkIn: "", checkOut: "" },
                { id: "SH-006", employeeId: "DL-009", date: dN1, shift: "Chiều", status: "scheduled", checkIn: "", checkOut: "" },
                { id: "SH-007", employeeId: "DL-010", date: dN1, shift: "Sáng",  status: "scheduled", checkIn: "", checkOut: "" },
                { id: "SH-008", employeeId: "DL-012", date: dN1, shift: "Tối",   status: "scheduled", checkIn: "", checkOut: "" },
                { id: "SH-009", employeeId: "DL-013", date: dP1, shift: "Tối",   status: "present", checkIn: "16:58", checkOut: "23:35" },
                { id: "SH-010", employeeId: "DL-010", date: dP1, shift: "Sáng",  status: "absent",  checkIn: "", checkOut: "" }
            ];
        })(),

        // ===================================================
        // TABLES CRUD
        // ===================================================
        getTables() {
            const s = localStorage.getItem("dalan_tables");
            if (!s) { this.resetTablesToMockData(); return this.MOCK_TABLES; }
            return JSON.parse(s);
        },
        saveTables(t) { localStorage.setItem("dalan_tables", JSON.stringify(t)); },
        resetTablesToMockData() { this.saveTables(this.MOCK_TABLES); },
        updateTable(id, patch) {
            const t = this.getTables();
            const i = t.findIndex(x => x.id === id);
            if (i === -1) return false;
            t[i] = { ...t[i], ...patch };
            this.saveTables(t);
            return true;
        },
        setTableStatus(id, status) { return this.updateTable(id, { status }); },

        // ===================================================
        // EVENTS CRUD
        // ===================================================
        getEvents() {
            const s = localStorage.getItem("dalan_events");
            if (!s) { this.resetEventsToMockData(); return this.MOCK_EVENTS; }
            return JSON.parse(s);
        },
        saveEvents(e) { localStorage.setItem("dalan_events", JSON.stringify(e)); },
        resetEventsToMockData() { this.saveEvents(this.MOCK_EVENTS); },
        addEvent(ev) { const e = this.getEvents(); e.push(ev); this.saveEvents(e); return true; },
        updateEvent(id, patch) {
            const e = this.getEvents();
            const i = e.findIndex(x => x.id === id);
            if (i === -1) return false;
            e[i] = { ...e[i], ...patch };
            this.saveEvents(e);
            return true;
        },
        deleteEvent(id) {
            const e = this.getEvents();
            const f = e.filter(x => x.id !== id);
            if (f.length === e.length) return false;
            this.saveEvents(f);
            return true;
        },
        // When an event is marked completed, post its revenue to the ledger
        completeEvent(id) {
            const e = this.getEvents();
            const i = e.findIndex(x => x.id === id);
            if (i === -1) return false;
            const ev = e[i];
            if (ev.status !== "completed") {
                ev.status = "completed";
                this.saveEvents(e);
                const txId = `TX-EVT-${id.split('-')[1] || ''}`;
                const exists = this.getTransactions().some(t => t.id === txId);
                if (!exists) {
                    this.addTransaction({
                        id: txId,
                        title: `Doanh thu sự kiện - ${ev.title}`,
                        amount: ev.budget,
                        type: "income",
                        category: "Doanh thu",
                        department: ev.unit,
                        date: ev.date,
                        notes: `Quyết toán sự kiện ${ev.type} (${ev.guests} khách). ${ev.notes || ''}`
                    });
                }
            }
            return true;
        },

        // ===================================================
        // SHIFTS / ATTENDANCE CRUD
        // ===================================================
        getShifts() {
            const s = localStorage.getItem("dalan_shifts");
            if (!s) { this.resetShiftsToMockData(); return this.MOCK_SHIFTS; }
            return JSON.parse(s);
        },
        saveShifts(s) { localStorage.setItem("dalan_shifts", JSON.stringify(s)); },
        resetShiftsToMockData() { this.saveShifts(this.MOCK_SHIFTS); },
        addShift(sh) { const s = this.getShifts(); s.push(sh); this.saveShifts(s); return true; },
        updateShift(id, patch) {
            const s = this.getShifts();
            const i = s.findIndex(x => x.id === id);
            if (i === -1) return false;
            s[i] = { ...s[i], ...patch };
            this.saveShifts(s);
            return true;
        },
        deleteShift(id) {
            const s = this.getShifts();
            const f = s.filter(x => x.id !== id);
            if (f.length === s.length) return false;
            this.saveShifts(f);
            return true;
        },
        getShiftType(key) { return this.SHIFT_TYPES.find(t => t.key === key) || this.SHIFT_TYPES[0]; },

        // ===================================================
        // ANALYTICS — cross-module reporting
        // ===================================================

        // Top selling dishes aggregated from all orders (completed weighted)
        getTopDishes(limit = 5) {
            const orders = this.getOrders();
            const tally = {};
            orders.forEach(o => {
                if (o.status === "cancelled") return;
                (o.items || []).forEach(it => {
                    const key = it.itemId || it.id || it.name;
                    if (!tally[key]) tally[key] = { name: it.name, qty: 0, revenue: 0 };
                    tally[key].qty += it.quantity;
                    tally[key].revenue += it.price * it.quantity;
                });
            });
            return Object.values(tally).sort((a, b) => b.qty - a.qty).slice(0, limit);
        },

        // Revenue split by department (income only)
        getRevenueByUnit() {
            const tx = this.getTransactions();
            const out = {};
            this.DEPARTMENTS.forEach(d => out[d] = 0);
            tx.forEach(t => {
                if (t.type === "income" && out[t.department] !== undefined) out[t.department] += Number(t.amount) || 0;
            });
            return out;
        },

        // Expense split by category
        getExpenseByCategory() {
            const tx = this.getTransactions();
            const out = {};
            tx.forEach(t => {
                if (t.type === "expense") {
                    const c = t.category || "Khác";
                    out[c] = (out[c] || 0) + (Number(t.amount) || 0);
                }
            });
            return out;
        },

        // Daily revenue & expense series for the last N days (from transactions)
        getDailySeries(days = 14) {
            const tx = this.getTransactions();
            const series = [];
            const base = new Date();
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(base);
                d.setDate(d.getDate() - i);
                const key = d.toISOString().substring(0, 10);
                series.push({ date: key, income: 0, expense: 0 });
            }
            const map = {};
            series.forEach(s => map[s.date] = s);
            tx.forEach(t => {
                if (map[t.date]) {
                    if (t.type === "income") map[t.date].income += Number(t.amount) || 0;
                    else map[t.date].expense += Number(t.amount) || 0;
                }
            });
            return series;
        },

        // Live operations snapshot for dashboard
        getOpsSnapshot() {
            const tables = this.getTables();
            const orders = this.getOrders();
            const events = this.getEvents();
            const todayIso = new Date().toISOString().substring(0, 10);
            return {
                tablesTotal: tables.length,
                tablesOccupied: tables.filter(t => t.status === "occupied").length,
                tablesReserved: tables.filter(t => t.status === "reserved").length,
                tablesAvailable: tables.filter(t => t.status === "available").length,
                activeOrders: orders.filter(o => o.status === "pending" || o.status === "preparing").length,
                pendingOrders: orders.filter(o => o.status === "pending").length,
                eventsUpcoming: events.filter(e => e.date >= todayIso && e.status !== "cancelled" && e.status !== "completed").length,
                eventsToday: events.filter(e => e.date === todayIso && e.status !== "cancelled").length
            };
        },

        // Attendance summary for a given date
        getAttendanceSummary(dateIso) {
            const shifts = this.getShifts().filter(s => s.date === dateIso);
            return {
                total: shifts.length,
                present: shifts.filter(s => s.status === "present").length,
                late: shifts.filter(s => s.status === "late").length,
                absent: shifts.filter(s => s.status === "absent").length,
                scheduled: shifts.filter(s => s.status === "scheduled").length
            };
        }
    });

    // Extend backup export/import to include new collections
    const _origExport = DaLanStore.exportData.bind(DaLanStore);
    DaLanStore.exportData = function () {
        const backup = {
            employees: this.getEmployees(),
            transactions: this.getTransactions(),
            orders: this.getOrders(),
            tables: this.getTables(),
            events: this.getEvents(),
            shifts: this.getShifts()
        };
        return "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    };

    const _origImport = DaLanStore.importData.bind(DaLanStore);
    DaLanStore.importData = function (jsonString) {
        const res = _origImport(jsonString);
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed && parsed.tables) this.saveTables(parsed.tables);
            if (parsed && parsed.events) this.saveEvents(parsed.events);
            if (parsed && parsed.shifts) this.saveShifts(parsed.shifts);
        } catch (e) { /* ignore */ }
        return res;
    };

    // Full reset helper (used by management)
    DaLanStore.resetAllExtData = function () {
        this.resetTablesToMockData();
        this.resetEventsToMockData();
        this.resetShiftsToMockData();
    };

    // Seed new collections on first load
    if (!localStorage.getItem("dalan_tables"))  DaLanStore.resetTablesToMockData();
    if (!localStorage.getItem("dalan_events"))  DaLanStore.resetEventsToMockData();
    if (!localStorage.getItem("dalan_shifts"))  DaLanStore.resetShiftsToMockData();

})();
