/* ----------------------------------------------------
   DA LAN PERSONNEL MANAGEMENT SYSTEM - UI COMPONENTS
   Renders dynamic, high-fidelity views and templates
------------------------------------------------------- */

const DaLanComponents = {
    
    // --- Helper: Format Currency VND ---
    formatVND(value) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },

    // --- Helper: Format Date ---
    formatDate(dateStr) {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    // ==========================================
    // 1. RENDER DASHBOARD (TỔNG QUAN)
    // ==========================================
    renderDashboard(container) {
        const stats = DaLanStore.getStats();
        const activePercentage = stats.total > 0 ? Math.round((stats.status.working / stats.total) * 100) : 0;
        const insuredPercentage = stats.total > 0 ? Math.round((stats.insurance.insured / stats.total) * 100) : 0;
        
        let html = `
            <!-- Welcome Accent Card -->
            <div class="ios-card accent-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 4px;">Công ty CP Dạ Lan</h2>
                        <p style="font-size: 13px; opacity: 0.9;">Hệ thống Quản lý Nhân sự Di động Chuyên nghiệp</p>
                    </div>
                    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='white'><path d='M50 15c-5 0-15 15-15 30 0 10 5 15 15 15s15-5 15-30c0-15-10-30-15-30zm-25 55c0-10 8-15 25-15s25 5 25 15c0 10-5 25-25 25S25 80 25 70z'/></svg>" style="width: 40px; height: 40px; opacity: 0.9;">
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="ios-card stat-item">
                    <span class="stat-label">Tổng nhân sự</span>
                    <span class="stat-value">${stats.total}</span>
                    <div class="stat-icon"><i data-feather="users"></i></div>
                </div>
                <div class="ios-card stat-item">
                    <span class="stat-label">Đang làm việc</span>
                    <span class="stat-value">${stats.status.working} <span style="font-size: 13px; color: var(--ios-green); font-weight: 500;">(${activePercentage}%)</span></span>
                    <div class="stat-icon"><i data-feather="activity"></i></div>
                </div>
                <div class="ios-card stat-item">
                    <span class="stat-label">Lương bình quân</span>
                    <span class="stat-value" style="font-size: 18px; margin-top: 8px;">${this.formatVND(stats.avgSalary).replace('₫', 'đ')}</span>
                    <div class="stat-icon"><i data-feather="dollar-sign"></i></div>
                </div>
                <div class="ios-card stat-item">
                    <span class="stat-label">Đã đóng BHXH</span>
                    <span class="stat-value">${stats.insurance.insured} <span style="font-size: 13px; color: var(--ios-blue); font-weight: 500;">(${insuredPercentage}%)</span></span>
                    <div class="stat-icon"><i data-feather="shield"></i></div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="ios-card">
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                    <i data-feather="pie-chart" style="color: var(--ios-red); width: 18px;"></i>
                    Thành viên theo Đơn vị
                </h3>
                
                <div class="chart-container">
                    ${this.generateDonutChart(stats.deptCounts, stats.total)}
                </div>
                
                <div class="chart-legend">
        `;

        // Generate dynamic legend
        const colors = ['#D32F2F', '#FF8A80', '#007AFF', '#34C759', '#FF9500'];
        DaLanStore.DEPARTMENTS.forEach((dept, idx) => {
            const count = stats.deptCounts[dept] || 0;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            html += `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${colors[idx % colors.length]};"></div>
                    <span style="font-weight: 500; flex: 1;">${dept}</span>
                    <span style="font-weight: 600; color: var(--text-primary);">${count} (${pct}%)</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>

            <!-- Recent Quick Actions -->
            <div class="ios-card" style="margin-bottom: 24px;">
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">Lối tắt nhanh</h3>
                <div style="display: flex; gap: 12px;">
                    <button class="ios-btn ios-btn-primary" onclick="App.openAddForm()" style="flex: 1; padding: 10px;">
                        <i data-feather="user-plus" style="width: 16px;"></i>
                        Thêm nhân sự
                    </button>
                    <button class="ios-btn ios-btn-secondary" onclick="App.switchTab('orgchart')" style="flex: 1; padding: 10px;">
                        <i data-feather="git-pull-request" style="width: 16px;"></i>
                        Xem sơ đồ
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        feather.replace();
    },

    // Helper: SVG Donut Chart Creator
    generateDonutChart(deptCounts, total) {
        if (total === 0) return `<div style="text-align: center; color: var(--text-secondary);">Chưa có dữ liệu</div>`;
        
        const colors = ['#D32F2F', '#FF8A80', '#007AFF', '#34C759', '#FF9500'];
        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        
        let cumulativePercent = 0;
        let svgSegments = "";
        
        DaLanStore.DEPARTMENTS.forEach((dept, idx) => {
            const count = deptCounts[dept] || 0;
            if (count === 0) return;
            
            const percent = count / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativePercent * circumference;
            const color = colors[idx % colors.length];
            
            svgSegments += `
                <circle class="donut-segment" 
                        cx="70" cy="70" r="${radius}" 
                        fill="transparent" 
                        stroke="${color}" 
                        stroke-width="16" 
                        stroke-dasharray="${strokeDasharray}" 
                        stroke-dashoffset="${strokeDashoffset}">
                </circle>
            `;
            
            cumulativePercent += percent;
        });

        return `
            <svg width="140" height="140" viewBox="0 0 140 140" class="svg-donut">
                <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="var(--bg-tertiary)" stroke-width="16"></circle>
                ${svgSegments}
            </svg>
            <div class="chart-center-text">
                <div class="chart-center-value" style="color: var(--text-primary);">${total}</div>
                <div class="chart-center-label">Nhân sự</div>
            </div>
        `;
    },

    // ==========================================
    // 2. RENDER EMPLOYEE DIRECTORY (DANH SÁCH)
    // ==========================================
    renderDirectory(container, searchQuery = "", filterDept = "Tất cả", filterStatus = "Tất cả") {
        const employees = DaLanStore.getEmployees();
        
        // Filter employees
        const filtered = employees.filter(emp => {
            const matchesSearch = searchQuery.trim() === "" || 
                emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.phone.includes(searchQuery) ||
                emp.role.toLowerCase().includes(searchQuery.toLowerCase());
                
            const matchesDept = filterDept === "Tất cả" || emp.department === filterDept;
            
            const matchesStatus = filterStatus === "Tất cả" || 
                (filterStatus === "Đang làm" && emp.status === "working") ||
                (filterStatus === "Nghỉ phép" && emp.status === "leave") ||
                (filterStatus === "Thử việc" && emp.status === "probation");
                
            return matchesSearch && matchesDept && matchesStatus;
        });

        // Group filtered employees by Department
        const grouped = {};
        DaLanStore.DEPARTMENTS.forEach(dept => {
            grouped[dept] = [];
        });
        
        filtered.forEach(emp => {
            if (grouped[emp.department]) {
                grouped[emp.department].push(emp);
            } else {
                grouped[emp.department] = [emp];
            }
        });

        let html = `
            <!-- Search Bar Wrapper -->
            <div class="ios-search-bar-container">
                <div class="ios-search-bar">
                    <i data-feather="search"></i>
                    <input type="text" id="directory-search-input" placeholder="Tìm kiếm tên, chức vụ, mã NV..." value="${searchQuery}">
                    ${searchQuery ? `<button id="search-clear-btn" style="background:none; border:none; color:var(--text-tertiary); cursor:pointer;"><i data-feather="x-circle" style="width:16px;"></i></button>` : ''}
                </div>
                
                <!-- Department Horizontal Filter Segmented Control -->
                <div class="ios-segmented-control" id="dept-segment-control">
                    <button class="segment-btn ${filterDept === "Tất cả" ? "active" : ""}" data-val="Tất cả">Tất cả</button>
                    ${DaLanStore.DEPARTMENTS.map(dept => `
                        <button class="segment-btn ${filterDept === dept ? "active" : ""}" data-val="${dept}">${dept}</button>
                    `).join('')}
                </div>

                <!-- Status Filter Segmented Control -->
                <div class="ios-segmented-control" id="status-segment-control" style="margin-top: -8px;">
                    <button class="segment-btn ${filterStatus === "Tất cả" ? "active" : ""}" data-val="Tất cả">Tất cả Trạng thái</button>
                    <button class="segment-btn ${filterStatus === "Đang làm" ? "active" : ""}" data-val="Đang làm">Đang làm</button>
                    <button class="segment-btn ${filterStatus === "Nghỉ phép" ? "active" : ""}" data-val="Nghỉ phép">Nghỉ phép</button>
                    <button class="segment-btn ${filterStatus === "Thử việc" ? "active" : ""}" data-val="Thử việc">Thử việc</button>
                </div>
            </div>

            <!-- Employee List grouped by Department -->
            <div class="employee-list">
        `;

        let totalRendered = 0;
        
        DaLanStore.DEPARTMENTS.forEach(dept => {
            const list = grouped[dept];
            if (list.length === 0) return; // Skip empty depts in filtered view
            
            totalRendered += list.length;
            
            html += `
                <div class="dept-group-header" style="font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; color: var(--ios-red); margin: 8px 4px 6px 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${dept} (${list.length})
                </div>
            `;
            
            list.forEach(emp => {
                const initials = DaLanStore.getInitials(emp.name);
                
                // Customize gradient backdrop based on department to make it visually exciting
                const colors = {
                    "Văn phòng": "linear-gradient(135deg, #C62828 0%, #FF8A80 100%)",
                    "Dạ Lan Center": "linear-gradient(135deg, #007AFF 0%, #80D8FF 100%)",
                    "Dạ Lan Star": "linear-gradient(135deg, #FF9500 0%, #FFE082 100%)",
                    "Dạ Lan Event": "linear-gradient(135deg, #9C27B0 0%, #EA80FC 100%)",
                    "Nhà máy Dạ Lan": "linear-gradient(135deg, #4CAF50 0%, #B9F6CA 100%)"
                };
                const bgGrad = colors[emp.department] || "linear-gradient(135deg, var(--ios-red) 0%, #FF8A80 100%)";
                
                html += `
                    <div class="employee-row-card" onclick="App.openProfile('${emp.id}')">
                        <div class="avatar-container" style="background: ${emp.avatar ? 'none' : bgGrad};">
                            ${emp.avatar ? `<img src="${emp.avatar}" class="avatar-image">` : initials}
                        </div>
                        <div class="employee-info-main">
                            <div class="employee-name">${emp.name}</div>
                            <div class="employee-meta">${emp.role}</div>
                            <div class="employee-badge-container">
                                <span class="status-badge ${emp.status}">
                                    ${emp.status === "working" ? "Đang làm" : emp.status === "leave" ? "Nghỉ phép" : "Thử việc"}
                                </span>
                                <span class="dept-badge">${emp.id}</span>
                            </div>
                        </div>
                        <i data-feather="chevron-right" class="chevron-right"></i>
                    </div>
                `;
            });
        });

        if (totalRendered === 0) {
            html += `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary); background-color: var(--bg-secondary); border-radius: 12px; border: 1px dashed var(--border-color); margin-top: 16px;">
                    <i data-feather="alert-circle" style="width: 36px; height: 36px; color: var(--text-tertiary); margin-bottom: 8px;"></i>
                    <p style="font-weight: 500;">Không tìm thấy nhân sự phù hợp</p>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;
        feather.replace();
        
        // Register events for filters inside app.js but after render
        App.bindDirectoryEvents();
    },

    // ==========================================
    // 3. RENDER ORGANIZATIONAL CHART (SƠ ĐỒ)
    // ==========================================
    renderOrgChart(container) {
        const employees = DaLanStore.getEmployees();
        
        // Find Director (Giám đốc)
        const director = employees.find(e => e.role === "Giám đốc");
        
        // Find Deputy Directors (PGĐ)
        const deputies = employees.filter(e => e.role.includes("Phó Giám đốc") || e.role.includes("PGĐ"));
        
        // Group others by department
        const deptManagers = {};
        const deptStaff = {};
        
        DaLanStore.DEPARTMENTS.forEach(dept => {
            deptManagers[dept] = employees.find(e => e.department === dept && e.role === "Quản lý trưởng");
            deptStaff[dept] = employees.filter(e => e.department === dept && e.role !== "Quản lý trưởng" && e.role !== "Giám đốc" && !e.role.includes("Phó Giám đốc") && !e.role.includes("PGĐ"));
        });

        let html = `
            <div class="org-chart-wrapper">
                <div class="org-tree">
                    
                    <!-- Ban Giám Đốc Cấp Cao -->
                    <div class="org-branch">
                        <!-- Director -->
                        ${director ? `
                            <div class="org-node director" onclick="App.openProfile('${director.id}')">
                                <div class="org-node-avatar" style="background-color: var(--ios-red-light); color: var(--ios-red);">${DaLanStore.getInitials(director.name)}</div>
                                <div class="org-node-name">${director.name}</div>
                                <div class="org-node-title">${director.role}</div>
                            </div>
                        ` : ''}
                        
                        <div class="org-connector-vertical"></div>
                        
                        <!-- Deputies Row -->
                        <div class="deputy-row">
                            ${deputies.map(dep => `
                                <div class="org-node deputy" onclick="App.openProfile('${dep.id}')">
                                    <div class="org-node-avatar" style="background-color: #FFF3E0; color: var(--ios-orange);">${DaLanStore.getInitials(dep.name)}</div>
                                    <div class="org-node-name">${dep.name}</div>
                                    <div class="org-node-title">${dep.role}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="org-connector-vertical" style="height: 30px;"></div>
                    
                    <!-- 5 Đơn Vị Thành Viên -->
                    <div class="departments-container">
                        ${DaLanStore.DEPARTMENTS.map(dept => {
                            const manager = deptManagers[dept];
                            const staff = deptStaff[dept] || [];
                            
                            return `
                                <div class="dept-branch">
                                    <!-- Department Title Header -->
                                    <div style="font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; background-color: var(--bg-tertiary); padding: 2px 8px; border-radius: 4px; white-space: nowrap;">
                                        ${dept}
                                    </div>
                                    
                                    <!-- Chief Manager Node -->
                                    ${manager ? `
                                        <div class="org-node manager" onclick="App.openProfile('${manager.id}')">
                                            <div class="org-node-avatar" style="background-color: #E3F2FD; color: var(--ios-blue);">${DaLanStore.getInitials(manager.name)}</div>
                                            <div class="org-node-name">${manager.name}</div>
                                            <div class="org-node-title">Quản lý trưởng</div>
                                        </div>
                                    ` : `
                                        <div class="org-node manager empty" style="border-style: dashed; border-left: none; background: none; justify-content: center;">
                                            <span style="font-size: 11px; color: var(--text-tertiary);">Trống</span>
                                        </div>
                                    `}
                                    
                                    <!-- Connecting staff list -->
                                    <div class="staff-list-node">
                                        ${staff.map(s => `
                                            <div class="org-node staff" onclick="App.openProfile('${s.id}')">
                                                <div class="org-node-name" style="font-size: 11px;">${s.name}</div>
                                                <div class="org-node-title" style="font-size: 9px;">${s.role}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                </div>
            </div>
            
            <p style="text-align: center; color: var(--text-secondary); font-size: 11px; margin-top: 24px; padding: 0 16px;">
                * Mẹo: Nhấn vào các thẻ nhân sự trên sơ đồ để xem thông tin liên lạc và chi tiết hồ sơ nhanh.
            </p>
        `;

        container.innerHTML = html;
        feather.replace();
    },

    // ==========================================
    // 4. RENDER SYSTEM / SETTINGS (QUẢN LÝ)
    // ==========================================
    renderManagement(container) {
        const stats = DaLanStore.getStats();
        
        let html = `
            <!-- Profile Info Header Group -->
            <div class="settings-list-group">
                <div class="settings-row" style="padding: 16px;">
                    <div class="settings-left">
                        <div class="avatar-container" style="background: linear-gradient(135deg, var(--ios-red) 0%, #FF8A80 100%);">DL</div>
                        <div>
                            <div style="font-weight: 700; font-size: 17px; font-family: 'Outfit', sans-serif;">Tổng Công ty CP Dạ Lan</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Mã số DN: 2800123456</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Display settings -->
            <div class="form-section-title">Giao diện & Tiện ích</div>
            <div class="settings-list-group">
                <!-- Dark Mode Toggle Row -->
                <div class="settings-row">
                    <div class="settings-left">
                        <div class="settings-icon-wrapper" style="background-color: #3f3f3f;">
                            <i data-feather="moon"></i>
                        </div>
                        <span>Chế độ tối (Dark Mode)</span>
                    </div>
                    <div class="settings-right">
                        <label class="ios-switch">
                            <input type="checkbox" id="dark-theme-toggle" ${document.body.classList.contains('dark-theme') ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Database & System Backups -->
            <div class="form-section-title">Cơ sở Dữ liệu & Hệ thống</div>
            <div class="settings-list-group">
                <!-- Export JSON -->
                <div class="settings-row" onclick="App.exportBackupData()">
                    <div class="settings-left">
                        <div class="settings-icon-wrapper" style="background-color: var(--ios-green);">
                            <i data-feather="download"></i>
                        </div>
                        <span>Sao lưu dữ liệu (Xuất file JSON)</span>
                    </div>
                    <div class="settings-right">
                        <i data-feather="chevron-right" style="width: 16px;"></i>
                    </div>
                </div>
                
                <!-- Import JSON -->
                <div class="settings-row" onclick="document.getElementById('import-file-selector').click();">
                    <div class="settings-left">
                        <div class="settings-icon-wrapper" style="background-color: var(--ios-blue);">
                            <i data-feather="upload"></i>
                        </div>
                        <span>Khôi phục dữ liệu (Nhập file JSON)</span>
                    </div>
                    <div class="settings-right">
                        <input type="file" id="import-file-selector" style="display:none;" accept=".json">
                        <i data-feather="chevron-right" style="width: 16px;"></i>
                    </div>
                </div>

                <!-- Reset Data Option -->
                <div class="settings-row" onclick="App.confirmResetMockData()">
                    <div class="settings-left">
                        <div class="settings-icon-wrapper" style="background-color: var(--ios-red);">
                            <i data-feather="rotate-ccw"></i>
                        </div>
                        <span style="color: var(--ios-red); font-weight: 500;">Đặt lại Dữ liệu mẫu ban đầu</span>
                    </div>
                    <div class="settings-right">
                        <i data-feather="chevron-right" style="width: 16px;"></i>
                    </div>
                </div>
            </div>

            <!-- Server Connection Guide -->
            <div class="form-section-title">Liên kết thiết bị iPhone</div>
            <div class="ios-card" style="padding: 16px; margin-bottom: 24px;">
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                    <div style="background-color: var(--ios-red-light); color: var(--ios-red); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i data-feather="phone-call" style="width: 16px;"></i>
                    </div>
                    <div>
                        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">Đang chạy Server kết nối</h4>
                        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
                            Để cài đặt và sử dụng ứng dụng Dạ Lan toàn màn hình trên iPhone, xin hãy chắc chắn bạn đã quét mã QR kết nối từ máy tính chạy script <code style="background-color: var(--bg-tertiary); padding: 2px 4px; border-radius: 4px; font-size: 10px;">start_server.py</code>.
                        </p>
                    </div>
                </div>
            </div>

            <div style="text-align: center; color: var(--text-tertiary); font-size: 11px; margin-bottom: 24px;">
                <p>Quản lý Nhân sự Dạ Lan v1.0.0</p>
                <p style="margin-top: 4px;">Thiết kế & Lập trình chuẩn Apple Human Interface</p>
            </div>
        `;

        container.innerHTML = html;
        feather.replace();

        // Bind theme switch events
        const toggle = document.getElementById("dark-theme-toggle");
        if (toggle) {
            toggle.addEventListener("change", function() {
                if (this.checked) {
                    document.body.classList.add("dark-theme");
                    localStorage.setItem("theme_pref", "dark");
                    App.showToast("Đã bật Chế độ tối (Dark Mode)", "success");
                } else {
                    document.body.classList.remove("dark-theme");
                    localStorage.setItem("theme_pref", "light");
                    App.showToast("Đã bật Chế độ sáng (Light Mode)", "success");
                }
            });
        }

        // Bind import file input event
        const importSelector = document.getElementById("import-file-selector");
        if (importSelector) {
            importSelector.addEventListener("change", function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    const result = DaLanStore.importData(event.target.result);
                    if (result.success) {
                        App.showToast(`Khôi phục thành công ${result.count} nhân sự!`, "success");
                        App.switchTab('directory');
                    } else {
                        App.showToast(result.error || "Nhập file thất bại", "error");
                    }
                };
                reader.readAsText(file);
            });
        }
    },

    // ==========================================
    // 5. RENDER PROFILE CARD DETAILS (BOTTOM SHEET)
    // ==========================================
    renderProfileDetails(emp, container) {
        const initials = DaLanStore.getInitials(emp.name);
        
        const colors = {
            "Vàn phòng": "linear-gradient(135deg, #C62828 0%, #FF8A80 100%)",
            "Dạ Lan Center": "linear-gradient(135deg, #007AFF 0%, #80D8FF 100%)",
            "Dạ Lan Star": "linear-gradient(135deg, #FF9500 0%, #FFE082 100%)",
            "Dạ Lan Event": "linear-gradient(135deg, #9C27B0 0%, #EA80FC 100%)",
            "Nhà máy Dạ Lan": "linear-gradient(135deg, #4CAF50 0%, #B9F6CA 100%)"
        };
        const bgGrad = colors[emp.department] || "linear-gradient(135deg, var(--ios-red) 0%, #FF8A80 100%)";
        
        let html = `
            <div class="profile-card-detail">
                <!-- Big Avatar -->
                <div class="profile-avatar-large" style="background: ${emp.avatar ? 'none' : bgGrad};">
                    ${emp.avatar ? `<img src="${emp.avatar}">` : initials}
                </div>
                <div class="profile-name">${emp.name}</div>
                <div class="profile-title">${emp.role}</div>
                
                <!-- Quick Contact Actions -->
                <div class="profile-quick-actions">
                    <button class="action-circle-btn" onclick="window.location.href='tel:${emp.phone}'">
                        <div class="circle-icon"><i data-feather="phone"></i></div>
                        <span>Gọi điện</span>
                    </button>
                    <button class="action-circle-btn" onclick="window.location.href='mailto:${emp.email}'">
                        <div class="circle-icon"><i data-feather="mail"></i></div>
                        <span>Email</span>
                    </button>
                    <button class="action-circle-btn" onclick="App.openEditForm('${emp.id}')">
                        <div class="circle-icon" style="color: var(--ios-blue);"><i data-feather="edit-2"></i></div>
                        <span>Sửa đổi</span>
                    </button>
                    <button class="action-circle-btn" onclick="App.confirmDelete('${emp.id}', '${emp.name}')">
                        <div class="circle-icon" style="color: var(--ios-red);"><i data-feather="trash-2"></i></div>
                        <span>Xóa bỏ</span>
                    </button>
                </div>
                
                <!-- Info List Group -->
                <div class="info-list-group">
                    <div class="info-row">
                        <span class="info-label">Mã Nhân viên</span>
                        <span class="info-value" style="font-weight: 700;">${emp.id}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cơ cấu Đơn vị</span>
                        <span class="info-value">${emp.department}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Căn cước công dân (CCCD)</span>
                        <span class="info-value">${emp.cccd || "Chưa cập nhật"}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Ngày vào công ty</span>
                        <span class="info-value">${this.formatDate(emp.joinDate)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Trạng thái BHXH</span>
                        <span class="info-value">
                            <span style="color: ${emp.insuranceStatus === "Đã đóng" ? "var(--ios-green)" : emp.insuranceStatus === "Tự nguyện" ? "var(--ios-blue)" : "var(--ios-red)"}; font-weight: 600;">
                                ${emp.insuranceStatus || "Chưa đóng"}
                            </span>
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Mức Lương chính thức</span>
                        <span class="info-value bold-red">${this.formatVND(emp.salary).replace('₫', 'đ')}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Trạng thái Nhân sự</span>
                        <span class="info-value">
                            <span class="status-badge ${emp.status}">
                                ${emp.status === "working" ? "Đang làm" : emp.status === "leave" ? "Nghỉ phép" : "Thử việc"}
                            </span>
                        </span>
                    </div>
                </div>

                ${emp.notes ? `
                    <div class="ios-card" style="width:100%; text-align:left; background-color: var(--bg-primary); padding: 12px 16px;">
                        <h4 style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 4px;">Ghi chú công tác</h4>
                        <p style="font-size: 13px; line-height: 1.4; color: var(--text-primary);">${emp.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.innerHTML = html;
        feather.replace();
    },

    // ==========================================
    // 6. RENDER EMPLOYEE FORM (THÊM / SỬA)
    // ==========================================
    renderEmployeeForm(emp, container) {
        const isEdit = emp !== null;
        const defaultId = `DL-${Math.floor(100 + Math.random() * 900)}`;
        
        const data = isEdit ? emp : {
            id: defaultId,
            name: "",
            role: "",
            department: "Văn phòng",
            phone: "",
            email: "",
            cccd: "",
            joinDate: new Date().toISOString().substring(0, 10),
            insuranceStatus: "Đã đóng",
            salary: "",
            status: "working",
            avatar: "",
            notes: ""
        };

        const initials = isEdit ? DaLanStore.getInitials(data.name) : "DL";

        let html = `
            <!-- Form Card Wrapper -->
            <form id="employee-detail-form" onsubmit="event.preventDefault();">
                
                <!-- Avatar Upload Section -->
                <div class="form-group-card avatar-upload-row">
                    <div class="avatar-preview-form" id="avatar-preview-container">
                        ${data.avatar ? `<img src="${data.avatar}" id="avatar-form-preview-img">` : `<span id="avatar-form-preview-initials">${initials}</span>`}
                    </div>
                    <label class="avatar-upload-btn" for="avatar-file-input">
                        <i data-feather="camera" style="width:12px; height:12px; vertical-align:middle; margin-right:4px;"></i>
                        Tải ảnh chân dung
                    </label>
                    <input type="file" id="avatar-file-input" class="avatar-file-input" accept="image/*">
                    <input type="hidden" id="form-avatar-base64" value="${data.avatar || ''}">
                </div>

                <div class="form-section-title">Hồ sơ Nhân sự chính thức</div>
                <div class="form-group-card">
                    <!-- ID (Readonly if edit) -->
                    <div class="form-row">
                        <label for="form-emp-id">Mã Nhân viên</label>
                        <input type="text" id="form-emp-id" value="${data.id}" placeholder="VD: DL-123" ${isEdit ? 'readonly style="color:var(--text-secondary);"' : 'required'}>
                    </div>
                    <!-- Full Name -->
                    <div class="form-row">
                        <label for="form-emp-name">Họ và Tên</label>
                        <input type="text" id="form-emp-name" value="${data.name}" placeholder="Nhập đầy đủ họ và tên" required>
                    </div>
                    <!-- CCCD -->
                    <div class="form-row">
                        <label for="form-emp-cccd">Mã số CCCD</label>
                        <input type="number" id="form-emp-cccd" value="${data.cccd}" placeholder="Nhập 12 số Căn cước" required>
                    </div>
                    <!-- Date of joining -->
                    <div class="form-row">
                        <label for="form-emp-join">Ngày vào làm</label>
                        <input type="date" id="form-emp-join" value="${data.joinDate}" required>
                    </div>
                </div>

                <div class="form-section-title">Cơ cấu & Chức vụ</div>
                <div class="form-group-card">
                    <!-- Department -->
                    <div class="form-row">
                        <label for="form-emp-dept">Đơn vị</label>
                        <select id="form-emp-dept" required>
                            ${DaLanStore.DEPARTMENTS.map(dept => `
                                <option value="${dept}" ${data.department === dept ? 'selected' : ''}>${dept}</option>
                            `).join('')}
                        </select>
                    </div>
                    <!-- Title / Role -->
                    <div class="form-row">
                        <label for="form-emp-role">Chức vụ</label>
                        <select id="form-emp-role" required>
                            <option value="Giám đốc" ${data.role === "Giám đốc" ? 'selected' : ''}>Giám đốc</option>
                            <option value="Phó Giám đốc Vận hành" ${data.role === "Phó Giám đốc Vận hành" ? 'selected' : ''}>Phó Giám đốc Vận hành</option>
                            <option value="Phó Giám đốc Kinh doanh" ${data.role === "Phó Giám đốc Kinh doanh" ? 'selected' : ''}>Phó Giám đốc Kinh doanh</option>
                            <option value="Quản lý trưởng" ${data.role === "Quản lý trưởng" ? 'selected' : ''}>Quản lý trưởng</option>
                            <option value="Kế toán trưởng" ${data.role === "Kế toán trưởng" ? 'selected' : ''}>Kế toán trưởng</option>
                            <option value="Nhân viên Hành chính" ${data.role === "Nhân viên Hành chính" ? 'selected' : ''}>Nhân viên Hành chính</option>
                            <option value="Bếp trưởng" ${data.role === "Bếp trưởng" ? 'selected' : ''}>Bếp trưởng</option>
                            <option value="Pha chế trưởng" ${data.role === "Pha chế trưởng" ? 'selected' : ''}>Pha chế trưởng</option>
                            <option value="Trưởng quầy Bar" ${data.role === "Trưởng quầy Bar" ? 'selected' : ''}>Trưởng quầy Bar</option>
                            <option value="Nhân viên Phục vụ" ${data.role === "Nhân viên Phục vụ" ? 'selected' : ''}>Nhân viên Phục vụ</option>
                            <option value="Kỹ thuật viên Âm thanh" ${data.role === "Kỹ thuật viên Âm thanh" ? 'selected' : ''}>Kỹ thuật viên Âm thanh</option>
                            <option value="Nhân viên Setup Sự kiện" ${data.role === "Nhân viên Setup Sự kiện" ? 'selected' : ''}>Nhân viên Setup Sự kiện</option>
                            <option value="Tổ trưởng Sản xuất" ${data.role === "Tổ trưởng Sản xuất" ? 'selected' : ''}>Tổ trưởng Sản xuất</option>
                            <option value="Công nhân Sản xuất" ${data.role === "Công nhân Sản xuất" ? 'selected' : ''}>Công nhân Sản xuất</option>
                        </select>
                    </div>
                </div>

                <div class="form-section-title">Chế độ Phúc lợi & Trạng thái</div>
                <div class="form-group-card">
                    <!-- Insurance status -->
                    <div class="form-row">
                        <label for="form-emp-insurance">Đóng BHXH</label>
                        <select id="form-emp-insurance" required>
                            <option value="Đã đóng" ${data.insuranceStatus === "Đã đóng" ? 'selected' : ''}>Đã đóng (Bắt buộc)</option>
                            <option value="Tự nguyện" ${data.insuranceStatus === "Tự nguyện" ? 'selected' : ''}>Tự nguyện</option>
                            <option value="Chưa đóng" ${data.insuranceStatus === "Chưa đóng" ? 'selected' : ''}>Chưa đóng</option>
                        </select>
                    </div>
                    <!-- Salary -->
                    <div class="form-row">
                        <label for="form-emp-salary">Mức lương (đ)</label>
                        <input type="number" id="form-emp-salary" value="${data.salary}" placeholder="Nhập số tiền VNĐ" required>
                    </div>
                    <!-- Status -->
                    <div class="form-row">
                        <label for="form-emp-status">Trạng thái</label>
                        <select id="form-emp-status" required>
                            <option value="working" ${data.status === "working" ? 'selected' : ''}>Đang làm việc</option>
                            <option value="leave" ${data.status === "leave" ? 'selected' : ''}>Nghỉ phép chế độ</option>
                            <option value="probation" ${data.status === "probation" ? 'selected' : ''}>Thử việc học việc</option>
                        </select>
                    </div>
                </div>

                <div class="form-section-title">Thông tin Liên lạc & Ghi chú</div>
                <div class="form-group-card">
                    <!-- Phone -->
                    <div class="form-row">
                        <label for="form-emp-phone">Số điện thoại</label>
                        <input type="tel" id="form-emp-phone" value="${data.phone}" placeholder="Nhập 10 số di động" required>
                    </div>
                    <!-- Email -->
                    <div class="form-row">
                        <label for="form-emp-email">Email</label>
                        <input type="email" id="form-emp-email" value="${data.email}" placeholder="username@dalan.com.vn" required>
                    </div>
                    <!-- Notes -->
                    <div class="form-row" style="align-items: flex-start; height: auto;">
                        <label for="form-emp-notes" style="margin-top: 4px;">Ghi chú</label>
                        <textarea id="form-emp-notes" rows="3" placeholder="Ghi chú nhiệm vụ, phân công..." style="resize:none; padding-top:4px;">${data.notes || ''}</textarea>
                    </div>
                </div>
            </form>
        `;

        container.innerHTML = html;
        feather.replace();

        // Bind image loader functionality instantly
        const fileInput = document.getElementById("avatar-file-input");
        const previewContainer = document.getElementById("avatar-preview-container");
        const base64Input = document.getElementById("form-avatar-base64");

        if (fileInput) {
            fileInput.addEventListener("change", function(e) {
                const file = e.target.files[0];
                if (!file) return;

                // Validate image size & type
                if (!file.type.startsWith('image/')) {
                    App.showToast("Chỉ hỗ trợ file hình ảnh!", "error");
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(evt) {
                    const base64String = evt.target.result;
                    base64Input.value = base64String;
                    previewContainer.innerHTML = `<img src="${base64String}" id="avatar-form-preview-img">`;
                };
                reader.readAsDataURL(file);
            });
        }
    }
};
