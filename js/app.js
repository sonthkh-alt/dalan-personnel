/* ----------------------------------------------------
   DA LAN PERSONNEL MANAGEMENT SYSTEM - CORE LOGIC
   Coordinates routing, modal state, events, and UI glue
------------------------------------------------------- */

const App = {
    currentTab: "dashboard",
    activeSearchQuery: "",
    activeFilterDept: "Tất cả",
    activeFilterStatus: "Tất cả",
    activeEditEmployeeId: null,
    activeTxSearchQuery: "",
    activeTxFilterType: "Tất cả",
    activeEditTransactionId: null,

    // --- Cart & Customer Ordering State ---
    isCustomerMode: false,
    cart: {},
    customerUnit: "Dạ Lan Center",
    customerTable: "Bàn 01",
    activeMenuCategory: "Tất cả",
    activeMenuSearchQuery: "",
    queueStatusFilter: "Tất cả",
    queueUnitFilter: "Tất cả",

    // --- Bootstrapping App ---
    init() {
        // Set dynamic date in header
        this.updateHeaderDate();

        // Restore theme preference
        const savedTheme = localStorage.getItem("theme_pref");
        if (savedTheme === "dark" || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add("dark-theme");
        }

        // Bind core navigation tab items
        const tabButtons = document.querySelectorAll(".tab-item");
        tabButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const targetTab = btn.getAttribute("data-tab");
                this.switchTab(targetTab);
            });
        });

        // Bind sheet close button
        const closeProfileBtn = document.getElementById("close-profile-btn");
        if (closeProfileBtn) {
            closeProfileBtn.addEventListener("click", () => this.closeProfile());
        }

        // Bind bottom sheet overlay tap to dismiss (very native iOS feel)
        const profileOverlay = document.getElementById("profile-overlay");
        if (profileOverlay) {
            profileOverlay.addEventListener("click", (e) => {
                if (e.target === profileOverlay) this.closeProfile();
            });
        }

        // Bind form modal action buttons
        const cancelFormBtn = document.getElementById("cancel-form-btn");
        if (cancelFormBtn) {
            cancelFormBtn.addEventListener("click", () => this.closeForm());
        }

        const saveFormBtn = document.getElementById("save-form-btn");
        if (saveFormBtn) {
            saveFormBtn.addEventListener("click", () => this.saveEmployeeForm());
        }

        // Bind transaction modal action buttons
        const cancelTxBtn = document.getElementById("cancel-transaction-btn");
        if (cancelTxBtn) {
            cancelTxBtn.addEventListener("click", () => this.closeTransactionForm());
        }

        const saveTxBtn = document.getElementById("save-transaction-btn");
        if (saveTxBtn) {
            saveTxBtn.addEventListener("click", () => this.saveTransactionForm());
        }

        // Bind transaction overlay tap to dismiss
        const txOverlay = document.getElementById("transaction-overlay");
        if (txOverlay) {
            txOverlay.addEventListener("click", (e) => {
                if (e.target === txOverlay) this.closeTransactionForm();
            });
        }

        // Bind cart sheet close button
        const closeCartBtn = document.getElementById("close-cart-btn");
        if (closeCartBtn) {
            closeCartBtn.addEventListener("click", () => this.closeCart());
        }

        // Bind cart sheet overlay tap to dismiss
        const cartOverlay = document.getElementById("cart-overlay");
        if (cartOverlay) {
            cartOverlay.addEventListener("click", (e) => {
                if (e.target === cartOverlay) this.closeCart();
            });
        }

        // Bind order queue modal close button
        const closeQueueBtn = document.getElementById("close-order-queue-btn");
        if (closeQueueBtn) {
            closeQueueBtn.addEventListener("click", () => this.closeOrderQueueModal());
        }

        // Bind order queue overlay tap to dismiss
        const queueOverlay = document.getElementById("order-queue-overlay");
        if (queueOverlay) {
            queueOverlay.addEventListener("click", (e) => {
                if (e.target === queueOverlay) this.closeOrderQueueModal();
            });
        }

        // Initial render
        this.renderCurrentView();
        
        // Add elastic header collapsing scroll effect
        this.setupElasticHeader();
        
        this.showToast("Dạ Lan chào mừng bạn!", "success");
    },

    // --- Update Dynamic Header Date ---
    updateHeaderDate() {
        const dateSpan = document.getElementById("header-date");
        if (dateSpan) {
            const today = new Date();
            const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
            const dayName = days[today.getDay()];
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            dateSpan.textContent = `${dayName}, ${dd}/${mm}`;
        }
    },

    // --- Elastic Collapsible Header Effect (iOS Native Scroll Feel) ---
    setupElasticHeader() {
        const contentArea = document.getElementById("main-content");
        const header = document.querySelector(".ios-header");
        
        if (contentArea && header) {
            contentArea.addEventListener("scroll", () => {
                if (contentArea.scrollTop > 30) {
                    header.classList.add("collapsed");
                } else {
                    header.classList.remove("collapsed");
                }
            });
        }
    },

    // --- Switching Active Tabs ---
    switchTab(tabName) {
        if (this.currentTab === tabName) return;

        // Reset scroll position on tab change
        const contentArea = document.getElementById("main-content");
        if (contentArea) contentArea.scrollTop = 0;

        // Update Nav UI Active Classes
        const tabButtons = document.querySelectorAll(".tab-item");
        tabButtons.forEach(btn => {
            if (btn.getAttribute("data-tab") === tabName) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        this.currentTab = tabName;
        
        // Update Titles
        const tabTitles = {
            "dashboard": "Tổng quan",
            "directory": "Danh sách",
            "orgchart": "Sơ đồ tổ chức",
            "finance": "Tài chính & Doanh thu",
            "management": "Quản lý hệ thống"
        };
        const titleEl = document.getElementById("tab-title");
        if (titleEl) {
            titleEl.textContent = tabTitles[tabName] || "Dạ Lan";
        }

        // Render Action Buttons on Header dynamically (e.g. Plus button on Directory)
        const headerAction = document.getElementById("header-action-container");
        if (headerAction) {
            if (tabName === "directory") {
                headerAction.innerHTML = `
                    <button class="nav-action-btn" onclick="App.openAddForm()">
                        <i data-feather="user-plus"></i>
                    </button>
                `;
            } else if (tabName === "finance") {
                headerAction.innerHTML = `
                    <button class="nav-action-btn" onclick="App.openTransactionForm()">
                        <i data-feather="plus"></i>
                    </button>
                `;
            } else if (tabName === "management") {
                headerAction.innerHTML = `
                    <button class="nav-action-btn" onclick="App.confirmResetMockData()">
                        <i data-feather="rotate-ccw" style="color:var(--ios-red);"></i>
                    </button>
                `;
            } else {
                headerAction.innerHTML = "";
            }
            feather.replace();
        }

        // Perform view rendering
        this.renderCurrentView();
    },

    // --- Render Active View Components ---
    renderCurrentView() {
        const mainContent = document.getElementById("main-content");
        if (!mainContent) return;

        if (this.isCustomerMode) {
            DaLanComponents.renderCustomerOrderPortal(mainContent, this.activeMenuCategory, this.activeMenuSearchQuery);
            return;
        }

        switch (this.currentTab) {
            case "dashboard":
                DaLanComponents.renderDashboard(mainContent);
                break;
            case "directory":
                DaLanComponents.renderDirectory(mainContent, this.activeSearchQuery, this.activeFilterDept, this.activeFilterStatus);
                break;
            case "orgchart":
                DaLanComponents.renderOrgChart(mainContent);
                break;
            case "finance":
                DaLanComponents.renderFinance(mainContent, this.activeTxSearchQuery, this.activeTxFilterType);
                break;
            case "management":
                DaLanComponents.renderManagement(mainContent);
                break;
        }
    },

    // ==========================================
    // DIRECTORY EVENT BINDINGS (REAL-TIME FILTERS)
    // ==========================================
    bindDirectoryEvents() {
        // Search Input
        const searchInput = document.getElementById("directory-search-input");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.activeSearchQuery = e.target.value;
                this.renderCurrentView();
                // Maintain focus on typing
                const newSearchInput = document.getElementById("directory-search-input");
                if (newSearchInput) {
                    newSearchInput.focus();
                    newSearchInput.setSelectionRange(newSearchInput.value.length, newSearchInput.value.length);
                }
            });
        }

        // Clear Search Button
        const clearBtn = document.getElementById("search-clear-btn");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                this.activeSearchQuery = "";
                this.renderCurrentView();
            });
        }

        // Department Segments
        const deptSegment = document.getElementById("dept-segment-control");
        if (deptSegment) {
            const buttons = deptSegment.querySelectorAll(".segment-btn");
            buttons.forEach(btn => {
                btn.addEventListener("click", () => {
                    this.activeFilterDept = btn.getAttribute("data-val");
                    this.renderCurrentView();
                });
            });
        }

        // Status Segments
        const statusSegment = document.getElementById("status-segment-control");
        if (statusSegment) {
            const buttons = statusSegment.querySelectorAll(".segment-btn");
            buttons.forEach(btn => {
                btn.addEventListener("click", () => {
                    this.activeFilterStatus = btn.getAttribute("data-val");
                    this.renderCurrentView();
                });
            });
        }
    },

    // ==========================================
    // PROFILE DETAILS SHEET (BOTTOM SHEET CONTROL)
    // ==========================================
    openProfile(empId) {
        const employees = DaLanStore.getEmployees();
        const emp = employees.find(e => e.id === empId);
        
        if (!emp) {
            this.showToast("Không tìm thấy nhân viên!", "error");
            return;
        }

        const body = document.getElementById("profile-modal-body");
        const overlay = document.getElementById("profile-overlay");
        
        if (body && overlay) {
            DaLanComponents.renderProfileDetails(emp, body);
            overlay.classList.add("active");
        }
    },

    closeProfile() {
        const overlay = document.getElementById("profile-overlay");
        if (overlay) {
            overlay.classList.remove("active");
        }
    },

    // ==========================================
    // FULL SCREEN FORM MODAL CONTROLS
    // ==========================================
    openAddForm() {
        this.activeEditEmployeeId = null;
        
        const body = document.getElementById("form-modal-body");
        const overlay = document.getElementById("form-overlay");
        const title = document.getElementById("form-modal-title");
        
        if (body && overlay && title) {
            title.textContent = "Thêm Nhân viên";
            DaLanComponents.renderEmployeeForm(null, body);
            overlay.classList.add("active");
        }
    },

    openEditForm(empId) {
        const employees = DaLanStore.getEmployees();
        const emp = employees.find(e => e.id === empId);

        if (!emp) {
            this.showToast("Không tìm thấy nhân sự!", "error");
            return;
        }

        this.activeEditEmployeeId = empId;
        this.closeProfile(); // Close profile details bottom-sheet first

        const body = document.getElementById("form-modal-body");
        const overlay = document.getElementById("form-overlay");
        const title = document.getElementById("form-modal-title");

        if (body && overlay && title) {
            title.textContent = "Chỉnh sửa Hồ sơ";
            DaLanComponents.renderEmployeeForm(emp, body);
            overlay.classList.add("active");
        }
    },

    closeForm() {
        const overlay = document.getElementById("form-overlay");
        if (overlay) {
            overlay.classList.remove("active");
        }
        this.activeEditEmployeeId = null;
    },

    // Save Form - Add or Update Employee
    saveEmployeeForm() {
        const form = document.getElementById("employee-detail-form");
        if (!form) return;

        // Validation
        const id = document.getElementById("form-emp-id").value.trim();
        const name = document.getElementById("form-emp-name").value.trim();
        const cccd = document.getElementById("form-emp-cccd").value.trim();
        const joinDate = document.getElementById("form-emp-join").value;
        const department = document.getElementById("form-emp-dept").value;
        const role = document.getElementById("form-emp-role").value;
        const insuranceStatus = document.getElementById("form-emp-insurance").value;
        const salary = Number(document.getElementById("form-emp-salary").value) || 0;
        const phone = document.getElementById("form-emp-phone").value.trim();
        const email = document.getElementById("form-emp-email").value.trim();
        const notes = document.getElementById("form-emp-notes").value.trim();
        const avatar = document.getElementById("form-avatar-base64").value;
        const status = document.getElementById("form-emp-status").value;

        if (!id || !name || !cccd || !phone || !email || !salary) {
            this.showToast("Vui lòng điền đủ các trường bắt buộc!", "error");
            return;
        }

        if (cccd.length !== 12) {
            this.showToast("Số CCCD phải gồm đúng 12 chữ số!", "error");
            return;
        }

        if (phone.length < 9 || phone.length > 11) {
            this.showToast("Số điện thoại không hợp lệ!", "error");
            return;
        }

        const employeeObj = {
            id, name, cccd, joinDate, department, role, insuranceStatus, salary, phone, email, notes, avatar, status
        };

        if (this.activeEditEmployeeId) {
            // Update operation
            const success = DaLanStore.updateEmployee(this.activeEditEmployeeId, employeeObj);
            if (success) {
                this.showToast(`Đã lưu thay đổi cho ${name}!`, "success");
            } else {
                this.showToast("Sửa đổi thất bại!", "error");
            }
        } else {
            // Add operation
            // Verify if ID already exists
            const exists = DaLanStore.getEmployees().some(e => e.id.toLowerCase() === id.toLowerCase());
            if (exists) {
                this.showToast(`Mã nhân sự ${id} đã tồn tại trong hệ thống!`, "error");
                return;
            }

            const success = DaLanStore.addEmployee(employeeObj);
            if (success) {
                this.showToast(`Đã thêm thành công ${name}!`, "success");
            } else {
                this.showToast("Thêm mới thất bại!", "error");
            }
        }

        // Close modal, reload current tab list
        this.closeForm();
        this.renderCurrentView();
    },

    // Delete Employee Action
    confirmDelete(empId, name) {
        if (confirm(`Bạn có chắc chắn muốn xóa nhân viên ${name} (${empId}) khỏi hệ thống Dạ Lan? Hành động này không thể hoàn tác.`)) {
            const success = DaLanStore.deleteEmployee(empId);
            if (success) {
                this.showToast(`Đã xóa ${name} khỏi hệ thống!`, "success");
                this.closeProfile();
                this.renderCurrentView();
            } else {
                this.showToast("Không thể xóa nhân sự!", "error");
            }
        }
    },

    // Reset Store Data Action
    confirmResetMockData() {
        if (confirm("Bạn có muốn đặt lại toàn bộ hệ thống về dữ liệu mẫu ban đầu của Dạ Lan không? Toàn bộ nhân viên và giao dịch tự thêm sẽ bị xóa.")) {
            DaLanStore.resetToMockData();
            DaLanStore.resetTransactionsToMockData();
            this.showToast("Đã đặt lại toàn bộ dữ liệu mẫu thành công!", "success");
            this.renderCurrentView();
        }
    },

    // ==========================================
    // FINANCE & TRANSACTION LEDGER EVENT BINDINGS
    // ==========================================
    bindFinanceEvents() {
        // Search Input
        const searchInput = document.getElementById("transaction-search-input");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.activeTxSearchQuery = e.target.value;
                this.renderCurrentView();
                // Maintain focus on typing
                const newSearchInput = document.getElementById("transaction-search-input");
                if (newSearchInput) {
                    newSearchInput.focus();
                    newSearchInput.setSelectionRange(newSearchInput.value.length, newSearchInput.value.length);
                }
            });
        }

        // Clear Search Button
        const clearBtn = document.getElementById("tx-search-clear-btn");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                this.activeTxSearchQuery = "";
                this.renderCurrentView();
            });
        }

        // Segment Filters
        const typeSegment = document.getElementById("tx-type-segment-control");
        if (typeSegment) {
            const buttons = typeSegment.querySelectorAll(".segment-btn");
            buttons.forEach(btn => {
                btn.addEventListener("click", () => {
                    this.activeTxFilterType = btn.getAttribute("data-val");
                    this.renderCurrentView();
                });
            });
        }
    },

    // ==========================================
    // TRANSACTION CRUD MODAL CONTROLS
    // ==========================================
    openTransactionForm() {
        this.activeEditTransactionId = null;
        
        const body = document.getElementById("transaction-modal-body");
        const overlay = document.getElementById("transaction-overlay");
        const title = document.getElementById("transaction-modal-title");
        
        if (body && overlay && title) {
            title.textContent = "Ghi chép Thu Chi";
            DaLanComponents.renderTransactionForm(null, body);
            overlay.classList.add("active");
        }
    },

    openEditTransactionForm(txId) {
        const transactions = DaLanStore.getTransactions();
        const tx = transactions.find(t => t.id === txId);

        if (!tx) {
            this.showToast("Không tìm thấy giao dịch!", "error");
            return;
        }

        this.activeEditTransactionId = txId;

        const body = document.getElementById("transaction-modal-body");
        const overlay = document.getElementById("transaction-overlay");
        const title = document.getElementById("transaction-modal-title");

        if (body && overlay && title) {
            title.textContent = "Sửa Giao dịch";
            DaLanComponents.renderTransactionForm(tx, body);
            overlay.classList.add("active");
        }
    },

    closeTransactionForm() {
        const overlay = document.getElementById("transaction-overlay");
        if (overlay) {
            overlay.classList.remove("active");
        }
        this.activeEditTransactionId = null;
    },

    saveTransactionForm() {
        const form = document.getElementById("transaction-detail-form");
        if (!form) return;

        // Validation & Parsing
        const id = document.getElementById("form-tx-id").value.trim();
        const title = document.getElementById("form-tx-title").value.trim();
        const amount = Number(document.getElementById("form-tx-amount").value) || 0;
        const date = document.getElementById("form-tx-date").value;
        const department = document.getElementById("form-tx-dept").value;
        const type = document.getElementById("form-tx-type").value;
        const category = document.getElementById("form-tx-category").value;
        const notes = document.getElementById("form-tx-notes").value.trim();

        if (!id || !title || !amount || !date || !department || !type || !category) {
            this.showToast("Vui lòng điền đủ các trường bắt buộc!", "error");
            return;
        }

        if (amount <= 0) {
            this.showToast("Số tiền giao dịch phải lớn hơn 0!", "error");
            return;
        }

        const txObj = {
            id, title, amount, date, department, type, category, notes
        };

        if (this.activeEditTransactionId) {
            // Update operation
            const success = DaLanStore.updateTransaction(this.activeEditTransactionId, txObj);
            if (success) {
                this.showToast("Cập nhật giao dịch thành công!", "success");
            } else {
                this.showToast("Cập nhật giao dịch thất bại!", "error");
            }
        } else {
            // Add operation
            // Verify if ID already exists
            const exists = DaLanStore.getTransactions().some(t => t.id === id);
            if (exists) {
                txObj.id = `TX-${Math.floor(100 + Math.random() * 900)}`;
            }

            const success = DaLanStore.addTransaction(txObj);
            if (success) {
                this.showToast("Thêm giao dịch thành công!", "success");
            } else {
                this.showToast("Thêm giao dịch thất bại!", "error");
            }
        }

        // Close modal, reload current tab
        this.closeTransactionForm();
        this.renderCurrentView();
    },

    confirmDeleteTransaction(txId) {
        if (confirm("Bạn có chắc chắn muốn xóa giao dịch này khỏi sổ quỹ Dạ Lan? Hành động này không thể hoàn tác.")) {
            const success = DaLanStore.deleteTransaction(txId);
            if (success) {
                this.showToast("Đã xóa giao dịch thành công!", "success");
                this.renderCurrentView();
            } else {
                this.showToast("Không thể xóa giao dịch!", "error");
            }
        }
    },

    // ==========================================
    // BACKUP SYSTEM - EXPORT DATA
    // ==========================================
    exportBackupData() {
        const link = document.createElement("a");
        link.setAttribute("href", DaLanStore.exportBackupData());
        link.setAttribute("download", `Backup_NhanSu_DaLan_${new Date().toISOString().substring(0, 10)}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast("Đã xuất tệp sao lưu JSON thành công!", "success");
    },

    // ==========================================
    // PHÂN HỆ HỆ THỐNG ĐẶT MÓN ĂN & XỬ LÝ ĐƠN HÀNG (F&B)
    // ==========================================
    enterCustomerMode() {
        this.isCustomerMode = true;
        this.cart = {}; // Clear cart
        this.activeMenuCategory = "Tất cả";
        this.activeMenuSearchQuery = "";
        
        document.body.classList.add("customer-active");
        
        const largeTitleContainer = document.querySelector(".ios-large-title-container");
        if (largeTitleContainer) largeTitleContainer.style.display = "none";
        
        const tabTitle = document.getElementById("tab-title");
        if (tabTitle) tabTitle.textContent = "Đặt món";

        const navBarTitle = document.querySelector(".ios-nav-bar-title");
        if (navBarTitle) navBarTitle.textContent = "Dạ Lan Menu";
        
        const headerAction = document.getElementById("header-action-container");
        if (headerAction) headerAction.innerHTML = "";

        this.renderCurrentView();
        this.showToast("Chào mừng đến với Dạ Lan F&B Digital Menu!", "success");
    },

    exitCustomerMode() {
        this.isCustomerMode = false;
        document.body.classList.remove("customer-active");
        
        const largeTitleContainer = document.querySelector(".ios-large-title-container");
        if (largeTitleContainer) largeTitleContainer.style.display = "block";
        
        this.switchTab("dashboard");
        this.showToast("Quay lại màn hình quản lý thành công!", "success");
    },

    setCustomerUnit(unit) {
        this.customerUnit = unit;
        this.renderCurrentView();
    },

    setCustomerTable(table) {
        this.customerTable = table;
        this.renderCurrentView();
    },

    addToCart(itemId) {
        if (!this.cart[itemId]) {
            this.cart[itemId] = 1;
        } else {
            this.cart[itemId]++;
        }
        
        this.showToast("Đã thêm vào giỏ hàng!", "success");
        this.renderCurrentView();
    },

    updateCartQty(itemId, change) {
        if (!this.cart[itemId]) return;
        this.cart[itemId] += change;
        if (this.cart[itemId] <= 0) {
            delete this.cart[itemId];
        }
        this.renderCurrentView();
    },

    getCartTotalQuantity() {
        return Object.values(this.cart).reduce((a, b) => a + b, 0);
    },

    getCartTotalPrice() {
        return Object.keys(this.cart).reduce((total, id) => {
            const item = DaLanStore.FOOD_MENU.find(m => m.id === id);
            return total + (item ? item.price * this.cart[id] : 0);
        }, 0);
    },

    openCartSummary() {
        const body = document.getElementById("cart-modal-body");
        const overlay = document.getElementById("cart-overlay");
        if (!body || !overlay) return;

        const cartItems = Object.keys(this.cart).filter(id => this.cart[id] > 0);
        if (cartItems.length === 0) {
            this.showToast("Giỏ hàng của bạn đang trống!", "error");
            return;
        }

        const catEmoji = { 'Khai vị': '🥗', 'Món chính': '🍲', 'Đồ uống': '🥤', 'Tráng miệng': '🍮' };
        let itemsHtml = '';
        let totalPrice = 0;

        cartItems.forEach(itemId => {
            const item = DaLanStore.FOOD_MENU.find(m => m.id === itemId);
            if (!item) return;
            const qty = this.cart[itemId];
            const itemTotal = item.price * qty;
            totalPrice += itemTotal;
            const em = catEmoji[item.category] || '🍽️';
            itemsHtml += `
                <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:0.5px solid var(--border-color);">
                    <div style="width:40px;height:40px;border-radius:10px;background:var(--brand-red-ghost);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${em}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.name}</div>
                        <div style="font-size:12px;color:var(--brand-red);font-weight:600;margin-top:1px;">${DaLanComponents.formatVND(item.price).replace('₫','d')}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                        <button onclick="App.updateCartQty('${item.id}',-1);App.openCartSummary();" style="width:26px;height:26px;border-radius:8px;border:none;background:var(--bg-tertiary);color:var(--text-primary);font-weight:800;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;">−</button>
                        <span style="font-size:14px;font-weight:800;color:var(--text-primary);font-family:'Outfit',sans-serif;min-width:20px;text-align:center;">${qty}</span>
                        <button onclick="App.updateCartQty('${item.id}',1);App.openCartSummary();" style="width:26px;height:26px;border-radius:8px;border:none;background:var(--brand-red);color:white;font-weight:800;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;">+</button>
                    </div>
                    <div style="font-size:13px;font-weight:700;color:var(--text-primary);font-family:'Outfit',sans-serif;min-width:68px;text-align:right;">${DaLanComponents.formatVND(itemTotal).replace('₫','d')}</div>
                </div>
            `;
        });

        body.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:14px;">
                <div style="display:flex;align-items:center;gap:8px;background:var(--brand-red-ghost);border:1px solid var(--brand-red-light);border-radius:10px;padding:10px 12px;">
                    <i data-feather="map-pin" style="width:15px;height:15px;color:var(--brand-red);flex-shrink:0;"></i>
                    <span style="font-size:13px;font-weight:600;color:var(--brand-red);">${this.customerTable} • ${this.customerUnit}</span>
                </div>
                <div style="overflow-y:auto;max-height:240px;">${itemsHtml}</div>
                <div>
                    <label style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:6px;">Lời nhắn cho Bếp</label>
                    <div style="display:flex;align-items:flex-start;gap:8px;background:var(--bg-tertiary);border-radius:12px;padding:10px 12px;border:0.5px solid var(--border-color);">
                        <i data-feather="message-circle" style="width:15px;height:15px;color:var(--text-secondary);margin-top:2px;flex-shrink:0;"></i>
                        <textarea id="order-general-notes" rows="2" placeholder="VD: ít cay, không hành, nước đá riêng..." style="flex:1;background:none;border:none;outline:none;font-size:13px;color:var(--text-primary);font-family:inherit;resize:none;line-height:1.5;"></textarea>
                    </div>
                </div>
                <div style="background:var(--bg-secondary);border:0.5px solid var(--border-color);border-radius:14px;padding:14px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                        <span style="font-size:14px;font-weight:500;color:var(--text-secondary);">Tổng tạm tính</span>
                        <span style="font-family:'Outfit',sans-serif;font-size:22px;font-weight:900;color:var(--brand-red);">${DaLanComponents.formatVND(totalPrice).replace('₫','d')}</span>
                    </div>
                    <button onclick="App.submitCustomerOrder()" style="width:100%;padding:14px;font-size:15px;font-weight:800;font-family:'Outfit',sans-serif;background:linear-gradient(135deg,var(--brand-red),var(--brand-red-mid));color:white;border:none;border-radius:14px;display:flex;justify-content:center;align-items:center;gap:10px;cursor:pointer;box-shadow:0 6px 20px rgba(198,40,40,0.3);">
                        <i data-feather="send" style="width:18px;"></i> Gửi Đơn Hàng Ngay
                    </button>
                </div>
            </div>
        `;

        feather.replace();
        overlay.classList.add("active");
    },

    closeCart() {
        const overlay = document.getElementById("cart-overlay");
        if (overlay) {
            overlay.classList.remove("active");
        }
    },

    submitCustomerOrder() {
        const noteEl = document.getElementById("order-general-notes");
        const notes = noteEl ? noteEl.value.trim() : "";

        const cartItems = Object.keys(this.cart).filter(id => this.cart[id] > 0);
        if (cartItems.length === 0) {
            this.showToast("Giỏ hàng đang trống!", "error");
            return;
        }

        const items = cartItems.map(itemId => {
            const item = DaLanStore.FOOD_MENU.find(m => m.id === itemId);
            return {
                id: itemId,
                name: item.name,
                price: item.price,
                quantity: this.cart[itemId]
            };
        });

        const totalAmount = this.getCartTotalPrice();
        const orderNum = Math.floor(1000 + Math.random() * 9000);
        const orderId = `ORD-${orderNum}`;

        const newOrder = {
            id: orderId,
            unit: this.customerUnit,
            table: this.customerTable,
            items: items,
            totalAmount: totalAmount,
            status: "pending",
            timestamp: new Date().toISOString(),
            notes: notes
        };

        const success = DaLanStore.addOrder(newOrder);
        if (success) {
            this.cart = {}; // Empty cart
            this.closeCart(); // Close bottom sheet
            this.renderCurrentView();
            this.showToast("Đã đặt món thành công! Bếp đang chuẩn bị.", "success");
        } else {
            this.showToast("Đặt món thất bại, vui lòng thử lại!", "error");
        }
    },

    bindCustomerMenuEvents() {
        const searchInput = document.getElementById("menu-search-input");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.activeMenuSearchQuery = e.target.value;
                this.renderCurrentView();
                const newSearchInput = document.getElementById("menu-search-input");
                if (newSearchInput) {
                    newSearchInput.focus();
                    newSearchInput.setSelectionRange(newSearchInput.value.length, newSearchInput.value.length);
                }
            });
        }

        const clearBtn = document.getElementById("menu-search-clear-btn");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                this.activeMenuSearchQuery = "";
                this.renderCurrentView();
            });
        }

        const segmentContainer = document.getElementById("menu-category-segment");
        if (segmentContainer) {
            const buttons = segmentContainer.querySelectorAll(".segment-btn");
            buttons.forEach(btn => {
                btn.addEventListener("click", () => {
                    this.activeMenuCategory = btn.getAttribute("data-val");
                    this.renderCurrentView();
                });
            });
        }
    },

    openOrderQueueModal() {
        const overlay = document.getElementById("order-queue-overlay");
        const body = document.getElementById("order-queue-modal-body");
        if (overlay && body) {
            DaLanComponents.renderOrderQueue(body, this.queueStatusFilter, this.queueUnitFilter);
            overlay.classList.add("active");
        }
    },

    closeOrderQueueModal() {
        const overlay = document.getElementById("order-queue-overlay");
        if (overlay) {
            overlay.classList.remove("active");
        }
    },

    refreshOrderQueue() {
        const body = document.getElementById("order-queue-modal-body");
        if (body) {
            DaLanComponents.renderOrderQueue(body, this.queueStatusFilter, this.queueUnitFilter);
        }
    },

    setQueueFilters() {
        const unitSel = document.getElementById("queue-unit-filter");
        const statusSel = document.getElementById("queue-status-filter");
        
        if (unitSel) this.queueUnitFilter = unitSel.value;
        if (statusSel) this.queueStatusFilter = statusSel.value;
        
        this.refreshOrderQueue();
    },

    changeOrderStatus(orderId, status) {
        const success = DaLanStore.updateOrderStatus(orderId, status);
        if (success) {
            let msg = "Đã cập nhật trạng thái đơn hàng!";
            if (status === "preparing") msg = "Đơn hàng bắt đầu chế biến!";
            else if (status === "completed") msg = "Đơn hàng hoàn tất & Đã tạo giao dịch doanh thu!";
            else if (status === "cancelled") msg = "Đã hủy đơn hàng thành công!";
            
            this.showToast(msg, "success");
            this.refreshOrderQueue();
            
            if (this.currentTab === "dashboard") {
                this.renderCurrentView();
            }
        } else {
            this.showToast("Cập nhật trạng thái thất bại!", "error");
        }
    },

    deleteOrderLog(orderId) {
        if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn lịch sử đơn hàng ${orderId} này không?`)) {
            const success = DaLanStore.deleteOrder(orderId);
            if (success) {
                this.showToast("Đã xóa lịch sử đơn hàng!", "success");
                this.refreshOrderQueue();
            } else {
                this.showToast("Xóa đơn hàng thất bại!", "error");
            }
        }
    },

    // ==========================================
    // DYNAMIC TOAST SYSTEM (iOS-like Toast notification)
    // ==========================================
    showToast(message, type = "success") {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "ios-toast";
        
        const iconName = type === "success" ? "check-circle" : "alert-triangle";
        const iconClass = type === "success" ? "toast-icon success" : "toast-icon error";

        toast.innerHTML = `
            <div class="${iconClass}"><i data-feather="${iconName}"></i></div>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        feather.replace();

        // Slide Up animation with browser frame delay
        setTimeout(() => {
            toast.classList.add("show");
        }, 50);

        // Slide down and remove toast
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2800);
    }
};

// Start the Application when DOM is fully ready
document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
