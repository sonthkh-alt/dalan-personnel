/* ----------------------------------------------------
   DẠ LAN SUITE v4.0 — MODULE VIEWS
   Pure renderers for: Operations hub + Floor map, Events,
   Shifts/Attendance, Reports/Analytics. Read store + App state.
   Controllers live in app-ext.js.
------------------------------------------------------- */

const DaLanModules = {

    // shared formatters (delegate to existing components)
    vnd(v) { return DaLanComponents.formatVND(v).replace('₫', 'đ'); },
    vndShort(v) {
        const n = Number(v) || 0;
        if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1) + ' tỷ';
        if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 0) + ' tr';
        if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(0) + 'k';
        return String(n);
    },
    date(d) { return DaLanComponents.formatDate(d); },
    emp(id) { return DaLanStore.getEmployees().find(e => e.id === id); },
    deptColor(unit) {
        return ({
            "Văn phòng": "#C62828", "Dạ Lan Center": "#007AFF", "Dạ Lan Star": "#FF9500",
            "Dạ Lan Event": "#5856D6", "Nhà máy Dạ Lan": "#34C759"
        })[unit] || "#8E8E93";
    },
    deptGrad(unit) {
        return ({
            "Văn phòng": "linear-gradient(135deg,#C62828,#FF8A80)",
            "Dạ Lan Center": "linear-gradient(135deg,#007AFF,#80D8FF)",
            "Dạ Lan Star": "linear-gradient(135deg,#FF9500,#FFE082)",
            "Dạ Lan Event": "linear-gradient(135deg,#5856D6,#B39DDB)",
            "Nhà máy Dạ Lan": "linear-gradient(135deg,#34C759,#B9F6CA)"
        })[unit] || "linear-gradient(135deg,#C62828,#FF8A80)";
    },

    // ==========================================
    // OPERATIONS HUB (Vận hành)
    // ==========================================
    renderOperations(container) {
        const snap = DaLanStore.getOpsSnapshot();
        const tables = DaLanStore.getTables();

        let html = `
            <div class="dl-ministat-row">
                <div class="dl-ministat"><div class="v" style="color:var(--tbl-busy);">${snap.tablesOccupied}</div><div class="l">Bàn dùng</div></div>
                <div class="dl-ministat"><div class="v" style="color:var(--tbl-free);">${snap.tablesAvailable}</div><div class="l">Bàn trống</div></div>
                <div class="dl-ministat"><div class="v" style="color:var(--ios-orange);">${snap.activeOrders}</div><div class="l">Đơn xử lý</div></div>
                <div class="dl-ministat"><div class="v" style="color:var(--ios-purple);">${snap.eventsUpcoming}</div><div class="l">Sự kiện</div></div>
            </div>

            <div class="dl-hub-grid">
                <div class="dl-hub-card hub-red" onclick="App.openFloorMap()">
                    <div class="hub-deco"></div>
                    <div class="hub-ic"><i data-feather="grid"></i></div>
                    ${snap.tablesOccupied > 0 ? `<span class="hub-badge">${snap.tablesOccupied} bàn</span>` : ''}
                    <div><h4>Sơ đồ bàn & POS</h4><p>Gọi món tại bàn, thanh toán nhanh</p></div>
                </div>
                <div class="dl-hub-card hub-blue" onclick="App.openOrderQueueModal()">
                    <div class="hub-deco"></div>
                    <div class="hub-ic"><i data-feather="shopping-bag"></i></div>
                    ${snap.pendingOrders > 0 ? `<span class="hub-badge">${snap.pendingOrders} chờ</span>` : ''}
                    <div><h4>Bếp & Đơn hàng</h4><p>Bảng Kanban chế biến món</p></div>
                </div>
                <div class="dl-hub-card hub-orange" onclick="App.enterCustomerMode()">
                    <div class="hub-deco"></div>
                    <div class="hub-ic"><i data-feather="tablet"></i></div>
                    <div><h4>Khách đặt món</h4><p>Thực đơn số hóa tại bàn</p></div>
                </div>
                <div class="dl-hub-card hub-purple" onclick="App.switchTab('events')">
                    <div class="hub-deco"></div>
                    <div class="hub-ic"><i data-feather="calendar"></i></div>
                    ${snap.eventsToday > 0 ? `<span class="hub-badge">${snap.eventsToday} hôm nay</span>` : ''}
                    <div><h4>Sự kiện & Tiệc</h4><p>Quản lý đặt tiệc, banquet</p></div>
                </div>
            </div>

            <div class="dl-section-head">
                <h3><i data-feather="map-pin" style="width:16px;color:var(--brand-red);"></i> Tình trạng bàn trực tiếp</h3>
                <span class="dl-link" onclick="App.openFloorMap()">Toàn màn hình <i data-feather="maximize-2" style="width:11px;"></i></span>
            </div>
            ${this.floorMapHtml(tables, "Dạ Lan Center")}
        `;
        container.innerHTML = html;
        feather.replace();
    },

    // Reusable floor map markup (a single unit)
    floorMapHtml(tables, unit) {
        const unitTables = tables.filter(t => t.unit === unit);
        const orders = DaLanStore.getOrders();
        const billOf = (t) => {
            if (t.currentOrderId) {
                const o = orders.find(x => x.id === t.currentOrderId);
                if (o) return o.items.reduce((s, i) => s + i.price * i.quantity, 0);
            }
            return null;
        };
        const statusLabel = { available: "Trống", occupied: "Đang dùng", reserved: "Đã đặt", cleaning: "Dọn bàn" };
        const zones = [...new Set(unitTables.map(t => t.zone))];

        let html = `
            <div class="floor-legend">
                <span><i style="background:var(--tbl-free)"></i> Trống</span>
                <span><i style="background:var(--tbl-busy)"></i> Đang dùng</span>
                <span><i style="background:var(--tbl-resv)"></i> Đã đặt</span>
                <span><i style="background:var(--tbl-clean)"></i> Dọn bàn</span>
            </div>`;

        zones.forEach(zone => {
            const zt = unitTables.filter(t => t.zone === zone);
            html += `<div class="floor-zone-title"><i data-feather="layout" style="width:13px;"></i> ${zone} · ${zt.length} bàn</div><div class="floor-grid">`;
            zt.forEach(t => {
                const bill = billOf(t);
                html += `
                    <div class="table-cell ${t.status}" onclick="App.openTableActions('${t.id}')">
                        <span class="tname">${t.name}</span>
                        <span class="tseat"><i data-feather="users" style="width:10px;height:10px;"></i> ${t.seats}</span>
                        <span class="tstatus">${statusLabel[t.status]}</span>
                        ${bill ? `<span class="tbill">${this.vndShort(bill)}</span>` : ''}
                    </div>`;
            });
            html += `</div>`;
        });
        return html;
    },

    // Full floor map (all units, switchable) — rendered into a sheet body
    renderFullFloor(container, activeUnit) {
        const tables = DaLanStore.getTables();
        const units = [...new Set(tables.map(t => t.unit))];
        let html = `<div class="dl-pill-row">`;
        units.forEach(u => {
            html += `<button class="dl-pill ${u === activeUnit ? 'active' : ''}" onclick="App.setFloorUnit('${u}')">${u}</button>`;
        });
        html += `</div>${this.floorMapHtml(tables, activeUnit)}`;
        container.innerHTML = html;
        feather.replace();
    },

    // ==========================================
    // EVENTS / BANQUET (Sự kiện & tiệc)
    // ==========================================
    renderEvents(container, filterDate) {
        const events = DaLanStore.getEvents().slice().sort((a, b) => a.date.localeCompare(b.date));
        const todayIso = new Date().toISOString().substring(0, 10);
        const evType = (k) => DaLanStore.EVENT_TYPES.find(t => t.key === k) || DaLanStore.EVENT_TYPES[5];

        // stats
        const upcoming = events.filter(e => e.date >= todayIso && e.status !== "cancelled" && e.status !== "completed");
        const monthRevenue = events
            .filter(e => e.date.substring(0, 7) === todayIso.substring(0, 7) && e.status !== "cancelled")
            .reduce((s, e) => s + (e.budget || 0), 0);
        const confirmedCount = events.filter(e => e.status === "confirmed" || e.status === "deposit").length;

        // date rail (next 14 days)
        const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        let rail = `<div class="date-rail">
            <div class="date-chip ${!filterDate ? 'active' : ''}" onclick="App.setEventDate(null)" style="width:auto;padding:8px 14px;">
                <div class="dw">Tất cả</div><div class="dd" style="font-size:14px;margin-top:4px;">${upcoming.length}</div>
            </div>`;
        const base = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date(base); d.setDate(d.getDate() + i);
            const di = d.toISOString().substring(0, 10);
            const has = events.some(e => e.date === di && e.status !== "cancelled");
            rail += `
                <div class="date-chip ${filterDate === di ? 'active' : ''}" onclick="App.setEventDate('${di}')">
                    <div class="dw">${days[d.getDay()]}</div>
                    <div class="dd">${d.getDate()}</div>
                    ${has ? '<span class="ev-dot"></span>' : ''}
                </div>`;
        }
        rail += `</div>`;

        const list = filterDate ? events.filter(e => e.date === filterDate) : upcoming;

        let cards = "";
        if (list.length === 0) {
            cards = `<div class="dl-empty"><i data-feather="calendar"></i><p style="font-weight:500;">Không có sự kiện ${filterDate ? 'trong ngày này' : 'sắp tới'}</p></div>`;
        } else {
            list.forEach(e => {
                const t = evType(e.type);
                const depPct = e.budget > 0 ? Math.round((e.deposit / e.budget) * 100) : 0;
                const stClass = { inquiry: 'ev-inquiry', confirmed: 'ev-confirmed', deposit: 'ev-deposit', completed: 'ev-completed', cancelled: 'ev-cancelled' }[e.status];
                const stLabel = { inquiry: 'Hỏi thông tin', confirmed: 'Đã chốt', deposit: 'Đã cọc', completed: 'Hoàn tất', cancelled: 'Đã hủy' }[e.status];
                cards += `
                    <div class="event-card" onclick="App.openEventDetail('${e.id}')">
                        <div class="event-card-top">
                            <div class="event-emoji" style="background:${t.color}22;">${t.emoji}</div>
                            <div class="event-card-main">
                                <div class="event-title">${e.title}</div>
                                <div class="event-sub">
                                    <span>${e.type}</span><span class="dot"></span>
                                    <span>${this.date(e.date)} · ${e.startTime}</span><span class="dot"></span>
                                    <span><i data-feather="users" style="width:11px;vertical-align:-1px;"></i> ${e.guests}</span>
                                </div>
                                <div class="event-sub"><i data-feather="map-pin" style="width:11px;"></i> ${e.hall} · ${e.unit}</div>
                            </div>
                            <span class="event-status-badge ${stClass}">${stLabel}</span>
                        </div>
                        <div class="event-card-foot">
                            <span class="event-budget">${this.vnd(e.budget)}</span>
                            <div class="event-progress">
                                <div class="ep-track"><div class="ep-fill" style="width:${depPct}%;"></div></div>
                                <div class="ep-label">Đã cọc ${this.vndShort(e.deposit)} · ${depPct}%</div>
                            </div>
                        </div>
                    </div>`;
            });
        }

        container.innerHTML = `
            <div class="event-stat-row">
                <div class="dl-ministat"><div class="v" style="color:var(--ios-purple);">${upcoming.length}</div><div class="l">Sắp diễn ra</div></div>
                <div class="dl-ministat"><div class="v" style="color:var(--brand-red);font-size:15px;">${this.vndShort(monthRevenue)}</div><div class="l">Doanh thu tháng</div></div>
                <div class="dl-ministat"><div class="v" style="color:var(--ios-green);">${confirmedCount}</div><div class="l">Đã chốt</div></div>
            </div>
            ${rail}
            <div class="dl-section-head" style="margin-top:8px;">
                <h3><i data-feather="calendar" style="width:16px;color:var(--ios-purple);"></i> ${filterDate ? 'Sự kiện ' + this.date(filterDate) : 'Sự kiện sắp tới'}</h3>
            </div>
            ${cards}
            <div style="height:24px;"></div>
        `;
        feather.replace();
    },

    // ==========================================
    // SHIFTS / ATTENDANCE (Xếp ca & chấm công)
    // ==========================================
    renderShifts(container) {
        const todayIso = new Date().toISOString().substring(0, 10);
        const summary = DaLanStore.getAttendanceSummary(todayIso);
        const shifts = DaLanStore.getShifts();
        const shiftType = (k) => DaLanStore.getShiftType(k);

        // attendance ring (present vs total expected today)
        const expected = summary.total || 1;
        const pct = Math.round((summary.present / expected) * 100);
        const R = 42, C = 2 * Math.PI * R;
        const presentArc = (summary.present / expected) * C;
        const lateArc = (summary.late / expected) * C;
        const absentArc = (summary.absent / expected) * C;

        // group shifts by date (today + future + recent past, sorted)
        const byDate = {};
        shifts.forEach(s => { (byDate[s.date] = byDate[s.date] || []).push(s); });
        const dates = Object.keys(byDate).sort();
        // bring today & future first, then past
        dates.sort((a, b) => {
            const af = a >= todayIso, bf = b >= todayIso;
            if (af && bf) return a.localeCompare(b);
            if (!af && !bf) return b.localeCompare(a);
            return af ? -1 : 1;
        });

        const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        const atClass = { present: 'at-present', late: 'at-late', absent: 'at-absent', scheduled: 'at-scheduled' };
        const atLabel = { present: 'Có mặt', late: 'Đi muộn', absent: 'Vắng', scheduled: 'Theo lịch' };

        let roster = "";
        dates.forEach(d => {
            const list = byDate[d].sort((a, b) => shiftType(a.shift).start.localeCompare(shiftType(b.shift).start));
            const dd = new Date(d);
            const isToday = d === todayIso;
            roster += `
                <div class="roster-day">
                    <div class="roster-day-head">
                        <span class="rd-date">${isToday ? '🔴 Hôm nay' : dayNames[dd.getDay()]}, ${this.date(d)}</span>
                        <span class="rd-count">${list.length} ca</span>
                    </div>
                    <div>`;
            list.forEach(s => {
                const e = this.emp(s.employeeId);
                const st = shiftType(s.shift);
                const time = (s.checkIn || s.checkOut) ? `${s.checkIn || '--:--'} → ${s.checkOut || '...'}` : `${st.start}–${st.end}`;
                roster += `
                    <div class="attend-row">
                        <div class="ar-avatar" style="background:${this.deptGrad(e ? e.department : '')};">${e ? DaLanStore.getInitials(e.name) : '?'}</div>
                        <div class="ar-main">
                            <div class="ar-name">${e ? e.name : s.employeeId}</div>
                            <div class="ar-time"><span class="shift-chip" style="background:${st.color};">${st.label}</span> &nbsp;${time}</div>
                        </div>
                        <span class="attend-status ${atClass[s.status]}" onclick="event.stopPropagation();App.cycleAttendance('${s.id}')">${atLabel[s.status]}</span>
                    </div>`;
            });
            roster += `</div></div>`;
        });

        container.innerHTML = `
            <div class="chart-card">
                <div class="attend-summary">
                    <div class="attend-ring">
                        <svg width="96" height="96" viewBox="0 0 96 96" style="transform:rotate(-90deg);">
                            <circle cx="48" cy="48" r="${R}" fill="none" stroke="var(--bg-tertiary)" stroke-width="9"/>
                            <circle cx="48" cy="48" r="${R}" fill="none" stroke="#34C759" stroke-width="9" stroke-dasharray="${presentArc} ${C}" stroke-dashoffset="0" stroke-linecap="round"/>
                            <circle cx="48" cy="48" r="${R}" fill="none" stroke="#FF9500" stroke-width="9" stroke-dasharray="${lateArc} ${C}" stroke-dashoffset="${-presentArc}"/>
                            <circle cx="48" cy="48" r="${R}" fill="none" stroke="#C62828" stroke-width="9" stroke-dasharray="${absentArc} ${C}" stroke-dashoffset="${-(presentArc + lateArc)}"/>
                        </svg>
                        <div class="ar-center"><div class="ar-pct">${pct}%</div><div class="ar-lbl">Có mặt</div></div>
                    </div>
                    <div class="attend-legend">
                        <div class="al"><span class="ld"><i style="background:#34C759;"></i> Có mặt</span><span class="lv">${summary.present}</span></div>
                        <div class="al"><span class="ld"><i style="background:#FF9500;"></i> Đi muộn</span><span class="lv">${summary.late}</span></div>
                        <div class="al"><span class="ld"><i style="background:#C62828;"></i> Vắng mặt</span><span class="lv">${summary.absent}</span></div>
                        <div class="al"><span class="ld"><i style="background:var(--bg-tertiary);"></i> Theo lịch</span><span class="lv">${summary.scheduled}</span></div>
                    </div>
                </div>
            </div>

            <div class="dl-fab-bar">
                <button class="ios-btn ios-btn-primary" onclick="App.openShiftForm()"><i data-feather="plus" style="width:16px;"></i> Xếp ca mới</button>
            </div>

            <div class="dl-section-head"><h3><i data-feather="clock" style="width:16px;color:var(--ios-blue);"></i> Lịch làm việc</h3></div>
            ${roster || '<div class="dl-empty"><i data-feather="clock"></i><p>Chưa có ca làm nào</p></div>'}
            <p style="text-align:center;color:var(--text-tertiary);font-size:11px;margin:16px 0 24px;">* Chạm vào trạng thái để chấm công nhanh: Theo lịch → Có mặt → Đi muộn → Vắng.</p>
        `;
        feather.replace();
    },

    // ==========================================
    // REPORTS / ANALYTICS (Báo cáo & phân tích)
    // ==========================================
    renderReports(container) {
        const fin = DaLanStore.getFinancialStats();
        const series = DaLanStore.getDailySeries(30);
        const topDishes = DaLanStore.getTopDishes(5);
        const revByUnit = DaLanStore.getRevenueByUnit();
        const expByCat = DaLanStore.getExpenseByCategory();

        // delta: last 7d income vs prior 7d
        const last7 = series.slice(-7).reduce((s, d) => s + d.income, 0);
        const prev7 = series.slice(-14, -7).reduce((s, d) => s + d.income, 0);
        const delta = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : (last7 > 0 ? 100 : 0);

        // ----- line chart -----
        const W = 300, H = 150, pad = 8;
        const maxV = Math.max(1, ...series.map(d => Math.max(d.income, d.expense)));
        const xStep = (W - pad * 2) / (series.length - 1);
        const yOf = (v) => H - pad - (v / maxV) * (H - pad * 2);
        const xOf = (i) => pad + i * xStep;
        const revPts = series.map((d, i) => `${xOf(i).toFixed(1)},${yOf(d.income).toFixed(1)}`).join(' ');
        const expPts = series.map((d, i) => `${xOf(i).toFixed(1)},${yOf(d.expense).toFixed(1)}`).join(' ');
        const areaPts = `${pad},${H - pad} ${revPts} ${W - pad},${H - pad}`;

        // ----- revenue by unit (hbars) -----
        const maxRev = Math.max(1, ...Object.values(revByUnit));
        let revBars = "";
        Object.entries(revByUnit).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).forEach(([u, v]) => {
            revBars += `
                <div class="hbar-row">
                    <div class="hbar-top"><span class="hbar-name">${u}</span><span class="hbar-val">${this.vndShort(v)}</span></div>
                    <div class="hbar-track"><div class="hbar-fill" style="width:${(v / maxRev) * 100}%;background:linear-gradient(90deg,${this.deptColor(u)},${this.deptColor(u)}88);"></div></div>
                </div>`;
        });

        // ----- top dishes -----
        const maxQty = Math.max(1, ...topDishes.map(d => d.qty));
        let dishBars = "";
        if (topDishes.length === 0) dishBars = `<p style="font-size:12px;color:var(--text-secondary);text-align:center;padding:10px;">Chưa có dữ liệu bán hàng</p>`;
        topDishes.forEach((d, i) => {
            dishBars += `
                <div class="hbar-row">
                    <div class="hbar-top"><span class="hbar-name"><span class="hbar-rank">${i + 1}</span>${d.name}</span><span class="hbar-val">${d.qty} phần · ${this.vndShort(d.revenue)}</span></div>
                    <div class="hbar-track"><div class="hbar-fill" style="width:${(d.qty / maxQty) * 100}%;"></div></div>
                </div>`;
        });

        // ----- expense donut -----
        const catColors = { "Giá vốn nguyên liệu": "#FF9500", "Chi phí vận hành": "#007AFF", "Khác": "#8E8E93" };
        const expEntries = Object.entries(expByCat).sort((a, b) => b[1] - a[1]);
        const expTotal = expEntries.reduce((s, [, v]) => s + v, 0) || 1;
        const RR = 50, CC = 2 * Math.PI * RR;
        let donutSegs = "", offset = 0, legend = "";
        expEntries.forEach(([cat, v], i) => {
            const frac = v / expTotal;
            const col = catColors[cat] || ["#5856D6", "#34C759", "#FF2D55"][i % 3];
            donutSegs += `<circle cx="60" cy="60" r="${RR}" fill="none" stroke="${col}" stroke-width="16" stroke-dasharray="${(frac * CC).toFixed(1)} ${CC}" stroke-dashoffset="${(-offset * CC).toFixed(1)}"/>`;
            offset += frac;
            legend += `<div class="al"><span class="ld"><i style="background:${col};"></i> ${cat}</span><span class="lv">${Math.round(frac * 100)}%</span></div>`;
        });

        container.innerHTML = `
            <div class="report-hero">
                <div class="rh-label">Lợi nhuận ròng kỳ này</div>
                <div class="rh-value">${fin.netProfit >= 0 ? '+' : ''}${this.vnd(fin.netProfit)}</div>
                <span class="rh-delta ${delta >= 0 ? 'rh-up' : 'rh-down'}"><i data-feather="${delta >= 0 ? 'trending-up' : 'trending-down'}" style="width:13px;"></i> ${delta >= 0 ? '+' : ''}${delta}% doanh thu 7 ngày</span>
                <div style="display:flex;gap:20px;margin-top:14px;">
                    <div><div style="font-size:10px;opacity:0.6;text-transform:uppercase;">Doanh thu</div><div style="font-family:'Outfit';font-weight:800;font-size:15px;">${this.vndShort(fin.totalRevenue)}</div></div>
                    <div><div style="font-size:10px;opacity:0.6;text-transform:uppercase;">Chi phí</div><div style="font-family:'Outfit';font-weight:800;font-size:15px;color:#FF8A80;">${this.vndShort(fin.totalExpenses)}</div></div>
                    <div><div style="font-size:10px;opacity:0.6;text-transform:uppercase;">Prime cost</div><div style="font-family:'Outfit';font-weight:800;font-size:15px;">${fin.primeCostPercent.toFixed(0)}%</div></div>
                </div>
            </div>

            <div class="chart-card">
                <div class="dl-section-head" style="margin-bottom:8px;"><h3 style="font-size:15px;"><i data-feather="activity" style="width:15px;color:var(--brand-red);"></i> Dòng tiền 30 ngày</h3></div>
                <div class="chart-legend-inline">
                    <span><i style="background:var(--brand-red);"></i> Doanh thu</span>
                    <span><i style="background:var(--ios-blue);"></i> Chi phí</span>
                </div>
                <svg class="line-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
                    <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#C62828" stop-opacity="0.25"/>
                        <stop offset="100%" stop-color="#C62828" stop-opacity="0"/>
                    </linearGradient></defs>
                    <line class="grid-line" x1="${pad}" y1="${H / 2}" x2="${W - pad}" y2="${H / 2}"/>
                    <polygon class="area-fill" points="${areaPts}"/>
                    <polyline class="rev-line" points="${revPts}"/>
                    <polyline class="exp-line" points="${expPts}"/>
                </svg>
                <div class="chart-x-labels">
                    <span>${this.date(series[0].date).substring(0, 5)}</span>
                    <span>${this.date(series[Math.floor(series.length / 2)].date).substring(0, 5)}</span>
                    <span>${this.date(series[series.length - 1].date).substring(0, 5)}</span>
                </div>
            </div>

            <div class="chart-card">
                <div class="dl-section-head" style="margin-bottom:12px;"><h3 style="font-size:15px;"><i data-feather="award" style="width:15px;color:var(--ios-orange);"></i> Top món bán chạy</h3></div>
                ${dishBars}
            </div>

            <div class="chart-card">
                <div class="dl-section-head" style="margin-bottom:12px;"><h3 style="font-size:15px;"><i data-feather="bar-chart-2" style="width:15px;color:var(--ios-blue);"></i> Doanh thu theo đơn vị</h3></div>
                ${revBars || '<p style="font-size:12px;color:var(--text-secondary);text-align:center;">Chưa có doanh thu</p>'}
            </div>

            <div class="chart-card">
                <div class="dl-section-head" style="margin-bottom:12px;"><h3 style="font-size:15px;"><i data-feather="pie-chart" style="width:15px;color:var(--ios-purple);"></i> Cơ cấu chi phí</h3></div>
                <div class="report-donut-wrap">
                    <div class="report-donut">
                        <svg width="120" height="120" viewBox="0 0 120 120" style="transform:rotate(-90deg);">
                            <circle cx="60" cy="60" r="${RR}" fill="none" stroke="var(--bg-tertiary)" stroke-width="16"/>
                            ${donutSegs}
                        </svg>
                        <div class="rd-center"><div class="rd-c-v">${this.vndShort(expTotal)}</div><div class="rd-c-l">Tổng chi</div></div>
                    </div>
                    <div class="attend-legend" style="flex:1;">${legend}</div>
                </div>
            </div>

            <div class="dl-fab-bar">
                <button class="ios-btn ios-btn-secondary" onclick="App.exportBackupData()"><i data-feather="download" style="width:15px;"></i> Xuất JSON</button>
                <button class="ios-btn ios-btn-primary" onclick="App.exportReportCSV()"><i data-feather="file-text" style="width:15px;"></i> Xuất CSV</button>
            </div>
            <div style="height:24px;"></div>
        `;
        feather.replace();
    }
};
