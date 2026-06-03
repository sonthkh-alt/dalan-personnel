/* ----------------------------------------------------
   DẠ LAN SUITE v4.0 — CONTROLLER EXTENSION
   Adds controllers for POS/Floor, Events, Shifts, Reports,
   reusable modal/sheet infra, and overrides navigation
   (switchTab / renderCurrentView) to host new tabs & hubs.
------------------------------------------------------- */

(function () {
    "use strict";

    const M = () => DaLanModules;
    const fmtVND = (v) => DaLanComponents.formatVND(v).replace('₫', 'đ');

    Object.assign(App, {
        // --- new view state ---
        hrSubview: "directory",       // directory | orgchart | shifts
        financeSubview: "ledger",     // ledger | reports
        eventFilterDate: null,
        floorUnit: "Dạ Lan Center",
        // POS state
        posTableId: null,
        posOrderId: null,
        posCart: {},
        posCategory: "Tất cả",
        activeEventId: null,

        // ==========================================
        // REUSABLE MODAL / SHEET INFRA (lazy DOM)
        // ==========================================
        _ensureSheet() {
            if (document.getElementById("dlx-sheet-overlay")) return;
            const el = document.createElement("div");
            el.className = "ios-bottom-sheet-overlay";
            el.id = "dlx-sheet-overlay";
            el.innerHTML = `
                <div class="ios-bottom-sheet" id="dlx-sheet">
                    <div class="sheet-drag-handle"></div>
                    <div class="sheet-header">
                        <h3 id="dlx-sheet-title">Chi tiết</h3>
                        <button class="sheet-close-btn" id="dlx-sheet-close"><i data-feather="x"></i></button>
                    </div>
                    <div class="sheet-body" id="dlx-sheet-body"></div>
                </div>`;
            document.body.appendChild(el);
            el.addEventListener("click", (e) => { if (e.target === el) App.closeSheet(); });
            document.getElementById("dlx-sheet-close").addEventListener("click", () => App.closeSheet());
        },
        openSheet(title, html) {
            this._ensureSheet();
            document.getElementById("dlx-sheet-title").textContent = title;
            document.getElementById("dlx-sheet-body").innerHTML = html;
            document.getElementById("dlx-sheet-overlay").classList.add("active");
            feather.replace();
        },
        closeSheet() {
            const el = document.getElementById("dlx-sheet-overlay");
            if (el) el.classList.remove("active");
        },

        _ensureFull() {
            if (document.getElementById("dlx-full-overlay")) return;
            const el = document.createElement("div");
            el.className = "ios-modal-overlay";
            el.id = "dlx-full-overlay";
            el.innerHTML = `
                <div class="ios-modal" id="dlx-full">
                    <header class="ios-modal-header">
                        <button class="modal-nav-btn cancel-btn" id="dlx-full-cancel">Hủy</button>
                        <h2 class="modal-title" id="dlx-full-title">Chi tiết</h2>
                        <button class="modal-nav-btn save-btn" id="dlx-full-save">Lưu</button>
                    </header>
                    <div class="ios-modal-body" id="dlx-full-body"></div>
                </div>`;
            document.body.appendChild(el);
            document.getElementById("dlx-full-cancel").addEventListener("click", () => App.closeFull());
        },
        openFull(title, html, onSave, saveLabel) {
            this._ensureFull();
            document.getElementById("dlx-full-title").textContent = title;
            document.getElementById("dlx-full-body").innerHTML = html;
            const saveBtn = document.getElementById("dlx-full-save");
            saveBtn.textContent = saveLabel || "Lưu";
            saveBtn.style.display = onSave ? "" : "none";
            const fresh = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(fresh, saveBtn);
            if (onSave) fresh.addEventListener("click", onSave);
            document.getElementById("dlx-full-overlay").classList.add("active");
            feather.replace();
        },
        closeFull() {
            const el = document.getElementById("dlx-full-overlay");
            if (el) el.classList.remove("active");
        },

        // ==========================================
        // NAVIGATION OVERRIDE
        // ==========================================
        switchTab(tabName) {
            if (this.currentTab === tabName && !this.isCustomerMode) {
                // allow re-render (e.g. exiting a sub-state)
            }
            const contentArea = document.getElementById("main-content");
            if (contentArea) contentArea.scrollTop = 0;

            document.querySelectorAll(".tab-item").forEach(btn => {
                btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
            });

            this.currentTab = tabName;

            const titles = {
                dashboard: "Tổng quan", operations: "Vận hành", events: "Sự kiện & Tiệc",
                hr: "Nhân sự", finance: "Tài chính", management: "Hệ thống"
            };
            const titleEl = document.getElementById("tab-title");
            if (titleEl) titleEl.textContent = titles[tabName] || "Dạ Lan";

            this._renderHeaderActions(tabName);
            this.renderCurrentView();
        },

        _renderHeaderActions(tabName) {
            const c = document.getElementById("header-action-container");
            if (!c) return;
            const gear = `<button class="nav-action-btn" onclick="App.switchTab('management')" title="Hệ thống"><i data-feather="settings"></i></button>`;
            let action = "";
            if (tabName === "hr") {
                action = this.hrSubview === "shifts"
                    ? `<button class="nav-action-btn" onclick="App.openShiftForm()"><i data-feather="plus"></i></button>`
                    : `<button class="nav-action-btn" onclick="App.openAddForm()"><i data-feather="user-plus"></i></button>`;
            } else if (tabName === "finance") {
                action = this.financeSubview === "ledger"
                    ? `<button class="nav-action-btn" onclick="App.openTransactionForm()"><i data-feather="plus"></i></button>` : "";
            } else if (tabName === "events") {
                action = `<button class="nav-action-btn" onclick="App.openEventForm()"><i data-feather="plus"></i></button>`;
            } else if (tabName === "management") {
                action = `<button class="nav-action-btn" onclick="App.confirmResetMockData()"><i data-feather="rotate-ccw" style="color:var(--ios-red);"></i></button>`;
            }
            c.innerHTML = (tabName === "management" ? "" : gear) + action;
            feather.replace();
        },

        renderCurrentView() {
            const main = document.getElementById("main-content");
            if (!main) return;
            if (this.isCustomerMode) {
                DaLanComponents.renderCustomerOrderPortal(main, this.activeMenuCategory, this.activeMenuSearchQuery);
                return;
            }
            switch (this.currentTab) {
                case "dashboard":   this._renderDashboard(main); break;
                case "operations":  M().renderOperations(main); break;
                case "events":      M().renderEvents(main, this.eventFilterDate); break;
                case "hr":          this._renderHRHub(main); break;
                case "finance":     this._renderFinanceHub(main); break;
                case "management":  DaLanComponents.renderManagement(main); break;
                default:            this._renderDashboard(main);
            }
        },

        // Enhanced dashboard = original + live ops snapshot + today events
        _renderDashboard(main) {
            DaLanComponents.renderDashboard(main);
            const snap = DaLanStore.getOpsSnapshot();
            const todayIso = new Date().toISOString().substring(0, 10);
            const todayEvents = DaLanStore.getEvents().filter(e => e.date === todayIso && e.status !== "cancelled");
            let extra = `
                <div class="dl-ministat-row" style="animation:fadeInUp 0.4s ease;">
                    <div class="dl-ministat" onclick="App.switchTab('operations')"><div class="v" style="color:var(--tbl-busy);">${snap.tablesOccupied}/${snap.tablesTotal}</div><div class="l">Bàn dùng</div></div>
                    <div class="dl-ministat" onclick="App.openOrderQueueModal()"><div class="v" style="color:var(--ios-orange);">${snap.activeOrders}</div><div class="l">Đơn bếp</div></div>
                    <div class="dl-ministat" onclick="App.switchTab('events')"><div class="v" style="color:var(--ios-purple);">${snap.eventsUpcoming}</div><div class="l">Sự kiện</div></div>
                    <div class="dl-ministat" onclick="App.switchTab('finance')"><div class="v" style="color:var(--ios-green);">${snap.tablesReserved}</div><div class="l">Đặt trước</div></div>
                </div>`;
            if (todayEvents.length) {
                extra += `<div class="ios-card" style="border-left:3px solid var(--ios-purple);animation:fadeInUp 0.4s ease;" onclick="App.switchTab('events')">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><i data-feather="calendar" style="width:15px;color:var(--ios-purple);"></i><span style="font-weight:800;font-family:'Outfit';font-size:14px;">Sự kiện hôm nay</span></div>
                    ${todayEvents.map(e => `<div style="font-size:13px;color:var(--text-primary);font-weight:600;">• ${e.title} <span style="color:var(--text-secondary);font-weight:400;">— ${e.startTime}, ${e.guests} khách</span></div>`).join('')}
                </div>`;
            }
            main.insertAdjacentHTML("afterbegin", extra);
            feather.replace();
        },

        // ==========================================
        // HR HUB (Danh sách / Sơ đồ / Ca & Chấm công)
        // ==========================================
        _renderHRHub(main) {
            const sv = this.hrSubview;
            main.innerHTML = `
                <div class="dl-subnav">
                    <button class="${sv === 'directory' ? 'active' : ''}" onclick="App.setHRSub('directory')"><i data-feather="users"></i> Danh sách</button>
                    <button class="${sv === 'orgchart' ? 'active' : ''}" onclick="App.setHRSub('orgchart')"><i data-feather="git-merge"></i> Sơ đồ</button>
                    <button class="${sv === 'shifts' ? 'active' : ''}" onclick="App.setHRSub('shifts')"><i data-feather="clock"></i> Ca & Chấm công</button>
                </div>
                <div id="hr-subview"></div>`;
            feather.replace();
            const sub = document.getElementById("hr-subview");
            if (sv === "directory") DaLanComponents.renderDirectory(sub, this.activeSearchQuery, this.activeFilterDept, this.activeFilterStatus);
            else if (sv === "orgchart") DaLanComponents.renderOrgChart(sub);
            else M().renderShifts(sub);
        },
        setHRSub(v) { this.hrSubview = v; this._renderHeaderActions("hr"); this._renderHRHub(document.getElementById("main-content")); },

        // ==========================================
        // FINANCE HUB (Sổ quỹ / Báo cáo)
        // ==========================================
        _renderFinanceHub(main) {
            const sv = this.financeSubview;
            main.innerHTML = `
                <div class="dl-subnav">
                    <button class="${sv === 'ledger' ? 'active' : ''}" onclick="App.setFinanceSub('ledger')"><i data-feather="book-open"></i> Sổ quỹ & P&L</button>
                    <button class="${sv === 'reports' ? 'active' : ''}" onclick="App.setFinanceSub('reports')"><i data-feather="pie-chart"></i> Báo cáo</button>
                </div>
                <div id="fin-subview"></div>`;
            feather.replace();
            const sub = document.getElementById("fin-subview");
            if (sv === "ledger") DaLanComponents.renderFinance(sub, this.activeTxSearchQuery, this.activeTxFilterType);
            else M().renderReports(sub);
        },
        setFinanceSub(v) { this.financeSubview = v; this._renderHeaderActions("finance"); this._renderFinanceHub(document.getElementById("main-content")); },

        // ==========================================
        // FLOOR MAP & TABLE ACTIONS
        // ==========================================
        openFloorMap() {
            this._ensureSheetFull();
            const body = document.getElementById("dlx-sheet-body");
            this.openSheet("Sơ đồ bàn — " + this.floorUnit, "");
            M().renderFullFloor(document.getElementById("dlx-sheet-body"), this.floorUnit);
        },
        _ensureSheetFull() { this._ensureSheet(); },
        setFloorUnit(u) {
            this.floorUnit = u;
            const t = document.getElementById("dlx-sheet-title");
            if (t) t.textContent = "Sơ đồ bàn — " + u;
            M().renderFullFloor(document.getElementById("dlx-sheet-body"), u);
        },

        openTableActions(tableId) {
            const t = DaLanStore.getTables().find(x => x.id === tableId);
            if (!t) return;
            const order = t.currentOrderId ? DaLanStore.getOrders().find(o => o.id === t.currentOrderId) : null;
            const bill = order ? order.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0;
            const statusLabel = { available: "Trống", occupied: "Đang phục vụ", reserved: "Đã đặt trước", cleaning: "Đang dọn" }[t.status];

            let actions = "";
            if (t.status === "available") {
                actions = `
                    <button class="ios-btn ios-btn-primary" onclick="App.startPOS('${t.id}')"><i data-feather="shopping-cart" style="width:16px;"></i> Mở bàn & Gọi món</button>
                    <button class="ios-btn ios-btn-warning" onclick="App.setTableStatus('${t.id}','reserved')"><i data-feather="bookmark" style="width:16px;"></i> Đặt trước</button>`;
            } else if (t.status === "reserved") {
                actions = `
                    <button class="ios-btn ios-btn-primary" onclick="App.startPOS('${t.id}')"><i data-feather="log-in" style="width:16px;"></i> Nhận khách & Gọi món</button>
                    <button class="ios-btn ios-btn-secondary" onclick="App.setTableStatus('${t.id}','available')">Hủy đặt</button>`;
            } else if (t.status === "occupied") {
                actions = `
                    <button class="ios-btn ios-btn-primary" onclick="App.startPOS('${t.id}')"><i data-feather="plus-circle" style="width:16px;"></i> Xem / Thêm món</button>
                    <button class="ios-btn ios-btn-success" onclick="App.payTable('${t.id}')"><i data-feather="check-circle" style="width:16px;"></i> Thanh toán & Dọn bàn</button>`;
            } else {
                actions = `<button class="ios-btn ios-btn-success" onclick="App.setTableStatus('${t.id}','available')"><i data-feather="check" style="width:16px;"></i> Dọn xong — Mở bàn</button>`;
            }

            this.openSheet(t.name + " · " + t.unit, `
                <div style="text-align:center;margin-bottom:18px;">
                    <div style="font-family:'Outfit';font-size:28px;font-weight:900;color:var(--text-primary);">${t.name}</div>
                    <div style="font-size:13px;color:var(--text-secondary);margin-top:2px;">${t.zone} · ${t.seats} chỗ · <strong>${statusLabel}</strong></div>
                    ${order ? `<div style="margin-top:10px;font-size:14px;">Hóa đơn hiện tại: <strong style="color:var(--brand-red);font-family:'Outfit';">${fmtVND(bill)}</strong> · ${order.items.length} món</div>` : ''}
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;">${actions}</div>
            `);
        },

        setTableStatus(id, status) {
            DaLanStore.setTableStatus(id, status);
            this.closeSheet();
            this.showToast("Đã cập nhật trạng thái bàn!", "success");
            this.renderCurrentView();
        },

        // ---- POS ----
        startPOS(tableId) {
            const t = DaLanStore.getTables().find(x => x.id === tableId);
            this.posTableId = tableId;
            this.posCart = {};
            this.posOrderId = null;
            this.posCategory = "Tất cả";
            if (t && t.currentOrderId) {
                const o = DaLanStore.getOrders().find(x => x.id === t.currentOrderId);
                if (o) { this.posOrderId = o.id; o.items.forEach(it => { this.posCart[it.itemId || it.id] = it.quantity; }); }
            }
            this.closeSheet();
            this._openPOS();
        },
        _openPOS() {
            const t = DaLanStore.getTables().find(x => x.id === this.posTableId);
            this.openFull(`POS · ${t ? t.name : ''}`, this._posBodyHtml(), null);
            // custom footer button handled inside body
        },
        _posBodyHtml() {
            const t = DaLanStore.getTables().find(x => x.id === this.posTableId);
            const menu = DaLanStore.FOOD_MENU;
            const cats = ["Tất cả", "Khai vị", "Món chính", "Đồ uống", "Tráng miệng"];
            const emoji = { 'Khai vị': '🥗', 'Món chính': '🍲', 'Đồ uống': '🥤', 'Tráng miệng': '🍮' };
            const filtered = this.posCategory === "Tất cả" ? menu : menu.filter(m => m.category === this.posCategory);
            const total = Object.keys(this.posCart).reduce((s, id) => { const m = menu.find(x => x.id === id); return s + (m ? m.price * this.posCart[id] : 0); }, 0);
            const count = Object.values(this.posCart).reduce((a, b) => a + b, 0);

            let pills = `<div class="pos-cat-row">` + cats.map(c =>
                `<button class="dl-pill ${c === this.posCategory ? 'active' : ''}" onclick="App.setPOSCat('${c}')">${c}</button>`).join('') + `</div>`;

            let items = filtered.map(m => {
                const qty = this.posCart[m.id] || 0;
                return `
                    <div class="pos-item">
                        <div class="pemoji">${emoji[m.category] || '🍽️'}</div>
                        <div class="pinfo"><div class="pname">${m.name}</div><div class="pprice">${fmtVND(m.price)}</div></div>
                        ${qty === 0
                        ? `<button class="food-add-btn" style="width:auto;padding:7px 14px;" onclick="App.posAdd('${m.id}')"><i data-feather="plus" style="width:13px;"></i></button>`
                        : `<div class="qty-step"><button class="minus" onclick="App.posUpd('${m.id}',-1)">−</button><span class="qn">${qty}</span><button class="plus" onclick="App.posUpd('${m.id}',1)">+</button></div>`}
                    </div>`;
            }).join('');

            return `
                <div class="pos-sheet-body" style="margin:-20px;">
                    <div class="pos-head">
                        <div><div class="ptitle">${t ? t.name : ''} · ${t ? t.zone : ''}</div><div class="pmeta">${t ? t.unit : ''} · ${this.posOrderId ? 'Bổ sung đơn ' + this.posOrderId : 'Đơn mới'}</div></div>
                        <div style="font-family:'Outfit';font-weight:800;color:var(--brand-red);">${count} món</div>
                    </div>
                    <div class="pos-menu-scroll">
                        ${pills}
                        ${items}
                    </div>
                    <div class="pos-footer">
                        <div class="pos-total-row"><span class="pt-l">Tổng tạm tính</span><span class="pt-v">${fmtVND(total)}</span></div>
                        <button class="ios-btn ios-btn-primary" style="width:100%;" onclick="App.submitPOS()">
                            <i data-feather="send" style="width:16px;"></i> ${this.posOrderId ? 'Cập nhật đơn xuống bếp' : 'Gửi xuống bếp'}
                        </button>
                    </div>
                </div>`;
        },
        _refreshPOS() {
            const body = document.getElementById("dlx-full-body");
            if (body) { body.innerHTML = this._posBodyHtml(); feather.replace(); }
        },
        setPOSCat(c) { this.posCategory = c; this._refreshPOS(); },
        posAdd(id) { this.posCart[id] = (this.posCart[id] || 0) + 1; this._refreshPOS(); },
        posUpd(id, d) { this.posCart[id] = (this.posCart[id] || 0) + d; if (this.posCart[id] <= 0) delete this.posCart[id]; this._refreshPOS(); },
        submitPOS() {
            const ids = Object.keys(this.posCart).filter(id => this.posCart[id] > 0);
            if (ids.length === 0) { this.showToast("Chưa chọn món nào!", "error"); return; }
            const t = DaLanStore.getTables().find(x => x.id === this.posTableId);
            const items = ids.map(id => {
                const m = DaLanStore.FOOD_MENU.find(x => x.id === id);
                return { itemId: id, name: m.name, price: m.price, quantity: this.posCart[id], notes: "" };
            });
            const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

            if (this.posOrderId) {
                // update existing order items
                const orders = DaLanStore.getOrders();
                const o = orders.find(x => x.id === this.posOrderId);
                if (o) { o.items = items; o.totalAmount = total; DaLanStore.saveOrders(orders); }
                this.showToast("Đã cập nhật đơn & báo bếp!", "success");
            } else {
                const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
                DaLanStore.addOrder({
                    id: orderId, unit: t.unit, table: t.name, items, totalAmount: total,
                    status: "pending", timestamp: new Date().toISOString(), notes: "Đơn tạo từ POS tại bàn"
                });
                DaLanStore.updateTable(this.posTableId, { status: "occupied", currentOrderId: orderId });
                this.showToast("Đã mở bàn & gửi đơn xuống bếp!", "success");
            }
            this.closeFull();
            this.renderCurrentView();
        },
        payTable(tableId) {
            const t = DaLanStore.getTables().find(x => x.id === tableId);
            if (t && t.currentOrderId) {
                const o = DaLanStore.getOrders().find(x => x.id === t.currentOrderId);
                if (o && o.status !== "completed") DaLanStore.updateOrderStatus(o.id, "completed");
            }
            DaLanStore.updateTable(tableId, { status: "available", currentOrderId: null });
            this.closeSheet();
            this.showToast("Đã thanh toán & ghi nhận doanh thu!", "success");
            this.renderCurrentView();
        },

        // ==========================================
        // EVENTS
        // ==========================================
        setEventDate(d) { this.eventFilterDate = d; this.renderCurrentView(); },

        openEventDetail(id) {
            const e = DaLanStore.getEvents().find(x => x.id === id);
            if (!e) return;
            this.activeEventId = id;
            const t = DaLanStore.EVENT_TYPES.find(x => x.key === e.type) || {};
            const stLabel = { inquiry: 'Hỏi thông tin', confirmed: 'Đã chốt', deposit: 'Đã đặt cọc', completed: 'Hoàn tất', cancelled: 'Đã hủy' }[e.status];
            const remain = (e.budget || 0) - (e.deposit || 0);
            const row = (l, v) => `<div class="info-row"><span class="info-label">${l}</span><span class="info-value">${v}</span></div>`;
            this.openSheet(e.title, `
                <div style="text-align:center;margin-bottom:14px;">
                    <div style="width:64px;height:64px;border-radius:18px;background:${t.color}22;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 8px;">${t.emoji || '📌'}</div>
                    <div style="font-family:'Outfit';font-size:18px;font-weight:800;">${e.title}</div>
                    <div style="font-size:13px;color:var(--text-secondary);margin-top:2px;">${e.type} · ${stLabel}</div>
                </div>
                <div class="info-list-group">
                    ${row("Thời gian", this.fmtDateFull(e.date) + " · " + e.startTime)}
                    ${row("Địa điểm", e.hall + " (" + e.unit + ")")}
                    ${row("Số khách", e.guests + " khách · " + (e.tables || 0) + " bàn")}
                    ${row("Thực đơn", e.menuPackage || "—")}
                    ${row("Ngân sách", `<span style="color:var(--brand-red);font-weight:800;">${fmtVND(e.budget)}</span>`)}
                    ${row("Đã đặt cọc", fmtVND(e.deposit))}
                    ${row("Còn lại", `<strong>${fmtVND(remain)}</strong>`)}
                    ${row("Liên hệ", e.contactName)}
                    ${row("Điện thoại", `<a href="tel:${e.contactPhone}" style="color:var(--ios-blue);">${e.contactPhone}</a>`)}
                </div>
                ${e.services && e.services.length ? `<div style="margin:0 0 14px;"><div class="form-section-title">Dịch vụ kèm theo</div><div style="display:flex;flex-wrap:wrap;gap:6px;">${e.services.map(s => `<span class="dept-badge" style="background:var(--brand-red-ghost);color:var(--brand-red);">${s}</span>`).join('')}</div></div>` : ''}
                ${e.notes ? `<div class="ios-card" style="background:var(--bg-primary);"><h4 style="font-size:11px;text-transform:uppercase;color:var(--text-secondary);margin-bottom:4px;">Ghi chú</h4><p style="font-size:13px;line-height:1.4;">${e.notes}</p></div>` : ''}
                <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
                    ${e.status !== 'completed' && e.status !== 'cancelled' ? `<button class="ios-btn ios-btn-success" onclick="App.completeEvent('${e.id}')"><i data-feather="check-circle" style="width:16px;"></i> Hoàn tất & Ghi doanh thu</button>` : ''}
                    <div style="display:flex;gap:10px;">
                        <button class="ios-btn ios-btn-secondary" onclick="App.openEventForm('${e.id}')"><i data-feather="edit-2" style="width:15px;"></i> Sửa</button>
                        ${e.status !== 'cancelled' && e.status !== 'completed' ? `<button class="ios-btn ios-btn-warning" onclick="App.cancelEvent('${e.id}')">Hủy tiệc</button>` : ''}
                        <button class="ios-btn ios-btn-danger" onclick="App.deleteEvent('${e.id}')"><i data-feather="trash-2" style="width:15px;"></i></button>
                    </div>
                </div>
            `);
        },
        fmtDateFull(d) {
            const dt = new Date(d);
            const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
            return `${days[dt.getDay()]}, ${DaLanComponents.formatDate(d)}`;
        },

        openEventForm(id) {
            const isEdit = !!id;
            const e = isEdit ? DaLanStore.getEvents().find(x => x.id === id) : null;
            this.activeEventId = id || null;
            const d = e || {
                id: `EVT-${Math.floor(100 + Math.random() * 900)}`, title: "", type: "Tiệc cưới",
                unit: "Dạ Lan Center", hall: "", date: new Date().toISOString().substring(0, 10), startTime: "18:00",
                guests: 100, tables: 10, status: "inquiry", contactName: "", contactPhone: "",
                budget: 0, deposit: 0, menuPackage: "", services: [], notes: ""
            };
            const opt = (val, cur) => `<option value="${val}" ${val === cur ? 'selected' : ''}>${val}</option>`;
            this.closeSheet();
            this.openFull(isEdit ? "Sửa sự kiện" : "Sự kiện mới", `
                <form id="evt-form" onsubmit="event.preventDefault();">
                    <div class="form-section-title">Thông tin sự kiện</div>
                    <div class="form-group-card">
                        <div class="form-row"><label>Tên sự kiện</label><input id="ef-title" value="${d.title}" placeholder="VD: Tiệc cưới A & B" required></div>
                        <div class="form-row"><label>Loại</label><select id="ef-type">${DaLanStore.EVENT_TYPES.map(t => opt(t.key, d.type)).join('')}</select></div>
                        <div class="form-row"><label>Đơn vị</label><select id="ef-unit">${DaLanStore.DEPARTMENTS.map(u => opt(u, d.unit)).join('')}</select></div>
                        <div class="form-row"><label>Sảnh / Phòng</label><input id="ef-hall" value="${d.hall}" placeholder="VD: Sảnh Hồng Ngọc"></div>
                    </div>
                    <div class="form-section-title">Thời gian & Quy mô</div>
                    <div class="form-group-card">
                        <div class="form-row"><label>Ngày</label><input type="date" id="ef-date" value="${d.date}"></div>
                        <div class="form-row"><label>Giờ bắt đầu</label><input type="time" id="ef-time" value="${d.startTime}"></div>
                        <div class="form-row"><label>Số khách</label><input type="number" id="ef-guests" value="${d.guests}"></div>
                        <div class="form-row"><label>Số bàn</label><input type="number" id="ef-tables" value="${d.tables}"></div>
                    </div>
                    <div class="form-section-title">Tài chính & Trạng thái</div>
                    <div class="form-group-card">
                        <div class="form-row"><label>Ngân sách (đ)</label><input type="number" id="ef-budget" value="${d.budget}"></div>
                        <div class="form-row"><label>Đặt cọc (đ)</label><input type="number" id="ef-deposit" value="${d.deposit}"></div>
                        <div class="form-row"><label>Gói thực đơn</label><input id="ef-menu" value="${d.menuPackage}" placeholder="VD: Set Menu Vàng 9 món"></div>
                        <div class="form-row" style="flex-direction:column;align-items:flex-start;gap:8px;">
                            <label>Trạng thái</label>
                            <div class="seg-status" id="ef-status">
                                ${[['inquiry', 'Hỏi TT'], ['confirmed', 'Đã chốt'], ['deposit', 'Đã cọc'], ['completed', 'Hoàn tất']].map(([v, l]) =>
                `<button type="button" class="${d.status === v ? 'active' : ''}" data-v="${v}" onclick="App._pickStatus(this)">${l}</button>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="form-section-title">Liên hệ & Dịch vụ</div>
                    <div class="form-group-card">
                        <div class="form-row"><label>Người liên hệ</label><input id="ef-contact" value="${d.contactName}"></div>
                        <div class="form-row"><label>Điện thoại</label><input id="ef-phone" value="${d.contactPhone}"></div>
                        <div class="form-row"><label>Dịch vụ</label><input id="ef-services" value="${(d.services || []).join(', ')}" placeholder="MC, Ban nhạc, ..."></div>
                        <div class="form-row" style="align-items:flex-start;"><label style="margin-top:4px;">Ghi chú</label><textarea id="ef-notes" rows="2" style="resize:none;">${d.notes || ''}</textarea></div>
                    </div>
                    <input type="hidden" id="ef-id" value="${d.id}">
                    <input type="hidden" id="ef-status-val" value="${d.status}">
                </form>
            `, () => this.saveEventForm(), "Lưu");
        },
        _pickStatus(btn) {
            btn.parentNode.querySelectorAll("button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById("ef-status-val").value = btn.getAttribute("data-v");
        },
        saveEventForm() {
            const g = (id) => document.getElementById(id);
            const title = g("ef-title").value.trim();
            if (!title) { this.showToast("Vui lòng nhập tên sự kiện!", "error"); return; }
            const obj = {
                id: g("ef-id").value, title, type: g("ef-type").value, unit: g("ef-unit").value,
                hall: g("ef-hall").value.trim(), date: g("ef-date").value, startTime: g("ef-time").value,
                guests: Number(g("ef-guests").value) || 0, tables: Number(g("ef-tables").value) || 0,
                status: g("ef-status-val").value, budget: Number(g("ef-budget").value) || 0,
                deposit: Number(g("ef-deposit").value) || 0, menuPackage: g("ef-menu").value.trim(),
                contactName: g("ef-contact").value.trim(), contactPhone: g("ef-phone").value.trim(),
                services: g("ef-services").value.split(",").map(s => s.trim()).filter(Boolean),
                notes: g("ef-notes").value.trim()
            };
            if (this.activeEventId && DaLanStore.getEvents().some(e => e.id === this.activeEventId)) {
                DaLanStore.updateEvent(this.activeEventId, obj);
                this.showToast("Đã cập nhật sự kiện!", "success");
            } else {
                if (DaLanStore.getEvents().some(e => e.id === obj.id)) obj.id = `EVT-${Math.floor(100 + Math.random() * 900)}`;
                DaLanStore.addEvent(obj);
                this.showToast("Đã thêm sự kiện mới!", "success");
            }
            this.closeFull();
            this.switchTab("events");
        },
        completeEvent(id) {
            DaLanStore.completeEvent(id);
            this.closeSheet();
            this.showToast("Sự kiện hoàn tất — đã ghi doanh thu vào sổ quỹ!", "success");
            this.renderCurrentView();
        },
        cancelEvent(id) {
            if (!confirm("Xác nhận hủy sự kiện này?")) return;
            DaLanStore.updateEvent(id, { status: "cancelled" });
            this.closeSheet();
            this.showToast("Đã hủy sự kiện.", "success");
            this.renderCurrentView();
        },
        deleteEvent(id) {
            if (!confirm("Xóa vĩnh viễn sự kiện này khỏi hệ thống?")) return;
            DaLanStore.deleteEvent(id);
            this.closeSheet();
            this.showToast("Đã xóa sự kiện.", "success");
            this.renderCurrentView();
        },

        // ==========================================
        // SHIFTS / ATTENDANCE
        // ==========================================
        openShiftForm() {
            const emps = DaLanStore.getEmployees();
            this.openSheet("Xếp ca làm việc", `
                <form id="sh-form" onsubmit="event.preventDefault();">
                    <div class="form-group-card">
                        <div class="form-row"><label>Nhân viên</label><select id="sh-emp">${emps.map(e => `<option value="${e.id}">${e.name} (${e.department})</option>`).join('')}</select></div>
                        <div class="form-row"><label>Ngày</label><input type="date" id="sh-date" value="${new Date().toISOString().substring(0, 10)}"></div>
                        <div class="form-row"><label>Ca làm</label><select id="sh-shift">${DaLanStore.SHIFT_TYPES.map(t => `<option value="${t.key}">${t.label} (${t.start}–${t.end})</option>`).join('')}</select></div>
                    </div>
                    <button class="ios-btn ios-btn-primary" style="width:100%;" onclick="App.saveShiftForm()"><i data-feather="check" style="width:16px;"></i> Lưu lịch ca</button>
                </form>
            `);
        },
        saveShiftForm() {
            const emp = document.getElementById("sh-emp").value;
            const date = document.getElementById("sh-date").value;
            const shift = document.getElementById("sh-shift").value;
            if (!emp || !date) { this.showToast("Thiếu thông tin ca làm!", "error"); return; }
            DaLanStore.addShift({ id: `SH-${Math.floor(100 + Math.random() * 900)}`, employeeId: emp, date, shift, status: "scheduled", checkIn: "", checkOut: "" });
            this.closeSheet();
            this.showToast("Đã xếp ca thành công!", "success");
            if (this.currentTab === "hr") this.setHRSub("shifts");
        },
        cycleAttendance(shiftId) {
            const s = DaLanStore.getShifts().find(x => x.id === shiftId);
            if (!s) return;
            const order = ["scheduled", "present", "late", "absent"];
            const next = order[(order.indexOf(s.status) + 1) % order.length];
            const now = new Date();
            const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const patch = { status: next };
            if (next === "present" || next === "late") patch.checkIn = s.checkIn || hhmm;
            if (next === "scheduled" || next === "absent") { patch.checkIn = ""; patch.checkOut = ""; }
            DaLanStore.updateShift(shiftId, patch);
            if (this.currentTab === "hr") this._renderHRHub(document.getElementById("main-content"));
        },

        // ==========================================
        // REPORTS EXPORT
        // ==========================================
        exportReportCSV() {
            const tx = DaLanStore.getTransactions();
            const header = "Mã,Tiêu đề,Loại,Hạng mục,Đơn vị,Ngày,Số tiền\n";
            const rows = tx.map(t => [t.id, `"${(t.title || '').replace(/"/g, "'")}"`, t.type === "income" ? "Thu" : "Chi", t.category, t.department, t.date, t.amount].join(",")).join("\n");
            const csv = "﻿" + header + rows; // BOM for Excel UTF-8
            const link = document.createElement("a");
            link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
            link.download = `BaoCao_DaLan_${new Date().toISOString().substring(0, 10)}.csv`;
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
            this.showToast("Đã xuất báo cáo CSV (mở bằng Excel)!", "success");
        },

        // extend reset to clear new collections too
        confirmResetMockData() {
            if (confirm("Đặt lại TOÀN BỘ hệ thống về dữ liệu mẫu ban đầu của Dạ Lan? (Nhân sự, giao dịch, đơn hàng, bàn, sự kiện, ca làm)")) {
                DaLanStore.resetToMockData();
                DaLanStore.resetTransactionsToMockData();
                DaLanStore.resetOrdersToMockData();
                DaLanStore.resetAllExtData();
                this.showToast("Đã đặt lại toàn bộ dữ liệu mẫu!", "success");
                this.renderCurrentView();
            }
        }
    });

    // After base App.init() runs (registered earlier on DOMContentLoaded),
    // render header actions for the initial tab so the settings gear appears.
    document.addEventListener("DOMContentLoaded", () => {
        try { App._renderHeaderActions(App.currentTab || "dashboard"); } catch (e) { /* noop */ }
    });
})();
