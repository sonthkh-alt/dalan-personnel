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
        if (confirm("Bạn có muốn đặt lại toàn bộ hệ thống về dữ liệu 20 nhân viên mẫu ban đầu của Dạ Lan không? Toàn bộ các thay đổi tự thêm sẽ bị xóa.")) {
            DaLanStore.resetToMockData();
            this.showToast("Đã đặt lại dữ liệu mẫu thành công!", "success");
            this.renderCurrentView();
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
