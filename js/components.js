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
        const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
        const activeOrders = DaLanStore.getOrders().filter(o => o.status === 'pending' || o.status === 'preparing');

        // Department progress data
        const deptColors = {
            'Văn phòng':      { bar: '#D32F2F', label: 'red'    },
            'Dạ Lan Center':  { bar: '#B71C1C', label: 'crimson' },
            'Dạ Lan Star':    { bar: '#FF9500', label: 'orange' },
            'Dạ Lan Event':   { bar: '#007AFF', label: 'blue'   },
            'Nhà máy Dạ Lan': { bar: '#34C759', label: 'green'  }
        };

        let html = `
            <!-- Executive Header Accent Card -->
            <div class="ios-card accent-card" style="animation: fadeInUp 0.4s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--brand-gold, #F9A825) 0%, #FFD54F 100%); display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 18px; color: #7B3F00; flex-shrink: 0; box-shadow: 0 3px 10px rgba(249,168,37,0.4);">DL</div>
                        <div>
                            <h2 style="font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 2px;">Công ty CP Dạ Lan</h2>
                            <p style="font-size: 11px; opacity: 0.85;">GĐ: Nguyễn Thị Hồng Liên</p>
                        </div>
                    </div>
                    <div style="text-align:right; font-size:10px; opacity:0.8; line-height:1.5;">${today}</div>
                </div>
            </div>

            <!-- 4 KPI Stats Grid -->
            <div class="stats-grid" style="animation: fadeInUp 0.4s ease;">
                <div class="stat-item red">
                    <div class="stat-icon-wrap red"><i data-feather="users" style="width:18px;"></i></div>
                    <span class="stat-label">Tổng nhân sự</span>
                    <span class="stat-value">${stats.total}</span>
                    <span class="stat-sub">toàn hệ thống</span>
                </div>
                <div class="stat-item green">
                    <div class="stat-icon-wrap green"><i data-feather="activity" style="width:18px;"></i></div>
                    <span class="stat-label">Đang làm việc</span>
                    <span class="stat-value">${stats.status.working}</span>
                    <span class="stat-sub">${activePercentage}% hoạt động</span>
                </div>
                <div class="stat-item gold">
                    <div class="stat-icon-wrap gold"><i data-feather="dollar-sign" style="width:18px;"></i></div>
                    <span class="stat-label">Lương bình quân</span>
                    <span class="stat-value" style="font-size:14px;">${this.formatVND(stats.avgSalary).replace('₫','đ')}</span>
                    <span class="stat-sub">mức lương trung bình</span>
                </div>
                <div class="stat-item blue">
                    <div class="stat-icon-wrap blue"><i data-feather="shield" style="width:18px;"></i></div>
                    <span class="stat-label">Đóng BHXH</span>
                    <span class="stat-value">${stats.insurance.insured}</span>
                    <span class="stat-sub">${insuredPercentage}% tham gia BH</span>
                </div>
            </div>

            <!-- Department Breakdown -->
            <div class="ios-card" style="animation: fadeInUp 0.4s ease;">
                <h3 style="font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:14px; display:flex; align-items:center; gap:8px;">
                    <i data-feather="bar-chart-2" style="width:16px; color:var(--brand-red,#D32F2F);"></i>
                    Nhân sự theo Đơn vị
                </h3>
                <div style="display:flex; flex-direction:column; gap:10px;">
        `;

        DaLanStore.DEPARTMENTS.forEach(dept => {
            const count = stats.deptCounts[dept] || 0;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            const dc = deptColors[dept] || { bar: '#888', label: 'gray' };
            html += `
                <div class="dept-progress-row">
                    <span class="dept-progress-label">${dept}</span>
                    <div class="dept-progress-track">
                        <div class="dept-progress-fill" style="width:${pct}%; background:${dc.bar};"></div>
                    </div>
                    <span class="dept-progress-count">${count}</span>
                </div>
            `;
        });

        const activeOrderCount = activeOrders.length;

        html += `
                </div>
            </div>

            <!-- F&B Order Suite Card -->
            <div class="ios-card" style="background: linear-gradient(135deg, var(--brand-red,#D32F2F) 0%, #b71c1c 100%); border:none; color:white; animation: fadeInUp 0.4s ease;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="background:rgba(255,255,255,0.2); width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center;">
                            <i data-feather="coffee" style="width:20px; color:white;"></i>
                        </div>
                        <div>
                            <span style="font-size:9px; text-transform:uppercase; font-weight:700; opacity:0.8; letter-spacing:0.5px; display:block;">Phân hệ F&B</span>
                            <h3 style="font-family:'Outfit',sans-serif; font-size:16px; font-weight:800; margin:0; color:white;">Dạ Lan Order Suite</h3>
                        </div>
                    </div>
                    ${activeOrderCount > 0 ? `<span style="background:white; color:var(--brand-red,#D32F2F); font-size:10px; font-weight:800; padding:3px 10px; border-radius:20px; display:flex; align-items:center; gap:4px;"><i data-feather="zap" style="width:10px;"></i>${activeOrderCount} đơn đang xử lý</span>` : `<span style="background:rgba(255,255,255,0.2); color:white; font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px;">Không có đơn</span>`}
                </div>
                <p style="font-size:11px; opacity:0.85; line-height:1.5; margin-bottom:14px;">Hệ thống gọi món số hóa tại bàn – tự động hạch toán dòng thu vào sổ quỹ.</p>
                <div style="display:flex; gap:10px;">
                    <button onclick="App.enterCustomerMode()" style="flex:1; background:white; border:none; color:var(--brand-red,#D32F2F); font-size:12px; font-weight:800; padding:10px; border-radius:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
                        <i data-feather="tablet" style="width:14px;"></i> Khách đặt món
                    </button>
                    <button onclick="App.openOrderQueueModal()" style="flex:1; background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.35); color:white; font-size:12px; font-weight:700; padding:10px; border-radius:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
                        <i data-feather="shopping-bag" style="width:14px;"></i> Bếp xử lý
                    </button>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="ios-card" style="margin-bottom:24px; animation: fadeInUp 0.4s ease;">
                <h3 style="font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                    <i data-feather="zap" style="width:16px; color:var(--brand-gold,#F9A825);"></i>
                    Lối tắt nhanh
                </h3>
                <div style="display:flex; gap:10px;">
                    <button class="ios-btn ios-btn-primary" onclick="App.openAddForm()" style="flex:1; padding:10px; display:flex; align-items:center; justify-content:center; gap:6px;">
                        <i data-feather="user-plus" style="width:15px;"></i> Thêm nhân sự
                    </button>
                    <button class="ios-btn ios-btn-secondary" onclick="App.openTransactionForm()" style="flex:1; padding:10px; display:flex; align-items:center; justify-content:center; gap:6px;">
                        <i data-feather="plus-circle" style="width:15px;"></i> Ghi giao dịch
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
    },

    // ==========================================
    // 7. RENDER FINANCE DASHBOARD (TÀI CHÍNH)
    // ==========================================
    renderFinance(container, searchQuery = "", filterType = "Tất cả") {
        const stats = DaLanStore.getFinancialStats();
        const transactions = DaLanStore.getTransactions();
        
        // P&L Dashboard Info
        const revenue = stats.totalRevenue;
        const foodCost = stats.foodCost;
        const laborCost = stats.laborCost;
        const opEx = stats.opEx;
        const netProfit = stats.netProfit;
        const totalExpenses = stats.totalExpenses;
        
        const primeCostPct = stats.primeCostPercent;
        const laborCostPct = stats.laborCostPercent;
        const foodCostPct = stats.foodCostPercent;
        
        // Determine health status of Prime Cost
        let primeStatusText = "An toàn (Tốt)";
        let primeStatusClass = "safe";
        let primeStatusNotes = "Chỉ số Prime Cost của chuỗi nhà hàng đang được kiểm soát rất tốt (< 60%). Đảm bảo lợi nhuận biên tối ưu.";
        
        if (primeCostPct >= 68) {
            primeStatusText = "Nguy cơ (Rủi ro cao)";
            primeStatusClass = "danger";
            primeStatusNotes = "Prime Cost vượt ngưỡng báo động (> 68%). Cần rà soát ngay giá thành thực phẩm hoặc tinh giản nhân sự.";
        } else if (primeCostPct >= 60) {
            primeStatusText = "Cảnh báo (Khá cao)";
            primeStatusClass = "warning";
            primeStatusNotes = "Prime Cost đang mấp mé vùng nguy hiểm (60% - 68%). Cần tối ưu chi phí nguyên vật liệu và năng suất lao động.";
        }

        // Filter transactions for ledger
        const filteredTx = transactions.filter(tx => {
            const matchesSearch = searchQuery.trim() === "" ||
                tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));
                
            const matchesType = filterType === "Tất cả" ||
                (filterType === "Khoản Thu" && tx.type === "income") ||
                (filterType === "Khoản Chi" && tx.type === "expense");
                
            return matchesSearch && matchesType;
        });

        let html = `
            <!-- F&B Business P&L Card -->
            <div class="ios-card accent-card" style="background: linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%); border: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div>
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; font-weight: 600;">Báo cáo P&L Tháng 05/2026</span>
                        <h2 style="font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800; margin-top: 2px;">
                            ${netProfit >= 0 ? '+' : ''}${this.formatVND(netProfit).replace('₫', 'đ')}
                        </h2>
                        <span style="font-size: 12px; opacity: 0.8;">Lợi nhuận ròng (Net Profit)</span>
                    </div>
                    <div style="background-color: ${netProfit >= 0 ? 'rgba(52, 199, 89, 0.2)' : 'rgba(211, 47, 47, 0.2)'}; color: ${netProfit >= 0 ? 'var(--ios-green)' : 'var(--ios-red)'}; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                        ${netProfit >= 0 ? 'Có Lãi' : 'Thua Lỗ'}
                    </div>
                </div>
                
                <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 12px 0;"></div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px 16px;">
                    <div>
                        <span style="font-size: 11px; opacity: 0.6; display: block;">Tổng doanh thu gộp</span>
                        <span style="font-size: 15px; font-weight: 700; color: #FFFFFF !important;">${this.formatVND(revenue).replace('₫', 'đ')}</span>
                    </div>
                    <div>
                        <span style="font-size: 11px; opacity: 0.6; display: block;">Tổng chi phí phát sinh</span>
                        <span style="font-size: 15px; font-weight: 700; color: #FF8A80 !important;">${this.formatVND(totalExpenses).replace('₫', 'đ')}</span>
                    </div>
                </div>
            </div>

            <!-- Detailed Cost Breakdown Grid -->
            <div class="stats-grid">
                <div class="ios-card stat-item" style="height: 80px;">
                    <span class="stat-label">Giá vốn thực phẩm</span>
                    <span class="stat-value" style="font-size: 16px; margin-top: 4px; color: var(--ios-orange);">${this.formatVND(foodCost).replace('₫', 'đ')}</span>
                    <span style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">Tỷ lệ: ${foodCostPct.toFixed(1)}% (COGS)</span>
                </div>
                <div class="ios-card stat-item" style="height: 80px;">
                    <span class="stat-label">Lao động (Dynamic)</span>
                    <span class="stat-value" style="font-size: 16px; margin-top: 4px; color: var(--ios-blue);">${this.formatVND(laborCost).replace('₫', 'đ')}</span>
                    <span style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">Tỷ lệ: ${laborCostPct.toFixed(1)}% (HR Link)</span>
                </div>
            </div>

            <!-- F&B Health Indicators Gauge Card -->
            <div class="ios-card">
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                    <i data-feather="heart" style="color: var(--ios-red); width: 18px;"></i>
                    Sức khỏe Tài chính F&B
                </h3>

                <!-- Prime Cost % Gauge -->
                <div class="health-gauge-container">
                    <div class="gauge-label-row">
                        <span>Chỉ số Prime Cost % (Food + Labor)</span>
                        <span style="color: var(--ios-${primeStatusClass === 'safe' ? 'green' : primeStatusClass === 'warning' ? 'orange' : 'red'}); font-weight:700;">
                            ${primeCostPct.toFixed(1)}% - ${primeStatusText}
                        </span>
                    </div>
                    <div class="gauge-track">
                        <!-- Threshold Markers at 60% and 68% -->
                        <div class="gauge-threshold-marker" style="left: 60%;"></div>
                        <div class="gauge-threshold-marker" style="left: 68%;"></div>
                        <div class="gauge-fill ${primeStatusClass}" style="width: ${Math.min(primeCostPct, 100)}%;"></div>
                    </div>
                    <div class="gauge-footer">
                        <span>An toàn < 60%</span>
                        <span>Cảnh báo 60-68%</span>
                        <span>Nguy cơ > 68%</span>
                    </div>
                </div>

                <div style="background-color: var(--bg-primary); border-radius: 8px; padding: 10px 12px; margin-bottom: 16px;">
                    <p style="font-size: 12px; line-height: 1.4; color: var(--text-secondary);">
                        <strong style="color: var(--text-primary);">Đánh giá Giám đốc:</strong> ${primeStatusNotes}
                    </p>
                </div>

                <!-- Secondary indicators (Food cost ratio & Labor cost ratio) -->
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
                    <!-- Food Cost ratio progress -->
                    <div>
                        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; font-weight: 500;">
                            <span>Tỷ lệ Giá vốn NVL (Mục tiêu: 28% - 35%)</span>
                            <span style="font-weight: 600; color: ${foodCostPct >= 28 && foodCostPct <= 35 ? 'var(--ios-green)' : 'var(--ios-orange)'};">${foodCostPct.toFixed(1)}%</span>
                        </div>
                        <div class="gauge-track" style="height: 6px;">
                            <div class="gauge-fill" style="width: ${Math.min(foodCostPct, 100)}%; background-color: ${foodCostPct >= 28 && foodCostPct <= 35 ? 'var(--ios-green)' : 'var(--ios-orange)'};"></div>
                        </div>
                    </div>
                    
                    <!-- Labor Cost ratio progress -->
                    <div>
                        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; font-weight: 500;">
                            <span>Tỷ lệ Chi phí Nhân sự (Mục tiêu: 25% - 30%)</span>
                            <span style="font-weight: 600; color: ${laborCostPct >= 25 && laborCostPct <= 30 ? 'var(--ios-green)' : 'var(--ios-orange)'};">${laborCostPct.toFixed(1)}%</span>
                        </div>
                        <div class="gauge-track" style="height: 6px;">
                            <div class="gauge-fill" style="width: ${Math.min(laborCostPct, 100)}%; background-color: ${laborCostPct >= 25 && laborCostPct <= 30 ? 'var(--ios-green)' : 'var(--ios-orange)'};"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Revenue Performance across 5 units -->
            <div class="ios-card">
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                    <i data-feather="bar-chart-2" style="color: var(--ios-red); width: 18px;"></i>
                    Doanh thu so với Chỉ tiêu Đơn vị
                </h3>
                
                <div class="financial-bars-container">
                    ${DaLanStore.DEPARTMENTS.map(dept => {
                        const actual = stats.unitRevenues[dept] || 0;
                        const target = stats.unitTargets[dept] || 0;
                        const expense = stats.unitExpenses[dept] || 0;
                        
                        if (target === 0) {
                            // Non-revenue cost center (e.g. Văn phòng)
                            return `
                                <div class="finance-bar-row">
                                    <div class="finance-bar-label">${dept}</div>
                                    <div style="flex:1; font-size:11px; color:var(--text-secondary); font-style:italic; padding-left: 10px;">
                                        Trung tâm Chi phí: ${this.formatVND(expense).replace('₫', 'đ')} (Lương & HĐ)
                                    </div>
                                </div>
                            `;
                        }
                        
                        const achievedPercent = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
                        const displayPercent = target > 0 ? Math.round((actual / target) * 100) : 0;
                        
                        return `
                            <div class="finance-bar-row">
                                <div class="finance-bar-label">${dept}</div>
                                <div class="finance-bar-track-wrapper">
                                    <div class="finance-bar-fill" style="width: ${achievedPercent}%;"></div>
                                </div>
                                <div class="finance-bar-value">
                                    ${this.formatVND(actual).replace('₫', 'đ')}
                                    <div style="font-size:10px; color:var(--text-secondary); font-weight:400;">Đạt ${displayPercent}%</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Transaction Ledger (Sổ quỹ thu chi) -->
            <div class="ios-search-bar-container" style="position: sticky; top: -16px; background-color: var(--bg-primary); padding: 10px 0; margin-top: 4px; z-index: 10;">
                <div class="ios-search-bar">
                    <i data-feather="search"></i>
                    <input type="text" id="transaction-search-input" placeholder="Tìm giao dịch, đơn vị, nội dung..." value="${searchQuery}">
                    ${searchQuery ? `<button id="tx-search-clear-btn" style="background:none; border:none; color:var(--text-tertiary); cursor:pointer;"><i data-feather="x-circle" style="width:16px;"></i></button>` : ''}
                </div>
                
                <!-- Income / Expense / All Filter -->
                <div class="ios-segmented-control" id="tx-type-segment-control" style="margin-top: 10px; margin-bottom: 0;">
                    <button class="segment-btn ${filterType === "Tất cả" ? "active" : ""}" data-val="Tất cả">Tất cả</button>
                    <button class="segment-btn ${filterType === "Khoản Thu" ? "active" : ""}" data-val="Khoản Thu">Khoản Thu (+)</button>
                    <button class="segment-btn ${filterType === "Khoản Chi" ? "active" : ""}" data-val="Khoản Chi">Khoản Chi (-)</button>
                </div>
            </div>

            <div class="transaction-list" style="margin-bottom: 24px;">
        `;

        if (filteredTx.length === 0) {
            html += `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary); background-color: var(--bg-secondary); border-radius: 12px; border: 1px dashed var(--border-color); margin-top: 10px;">
                    <i data-feather="dollar-sign" style="width: 36px; height: 36px; color: var(--text-tertiary); margin-bottom: 8px;"></i>
                    <p style="font-weight: 500;">Không có giao dịch thu chi nào phù hợp</p>
                </div>
            `;
        } else {
            filteredTx.forEach(tx => {
                const isIncome = tx.type === "income";
                const amountFormatted = (isIncome ? '+' : '-') + this.formatVND(tx.amount).replace('₫', 'đ');
                
                // Beautiful icons based on category
                let icon = "dollar-sign";
                if (tx.category === "Giá vốn nguyên liệu") icon = "shopping-cart";
                else if (tx.category === "Chi phí vận hành") icon = "settings";
                else if (tx.category === "Doanh thu") icon = "trending-up";
                
                html += `
                    <div class="transaction-card">
                        <div class="transaction-icon-box ${tx.type}">
                            <i data-feather="${icon}"></i>
                        </div>
                        <div class="transaction-info" onclick="App.openEditTransactionForm('${tx.id}')">
                            <div class="transaction-title">${tx.title}</div>
                            <div class="transaction-meta">
                                <span style="font-weight:600; color:var(--text-primary);">${tx.department}</span> • ${this.formatDate(tx.date)}
                                ${tx.notes ? `<div style="font-size:10px; color:var(--text-secondary); margin-top: 2px; font-style: italic;">${tx.notes}</div>` : ''}
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div class="transaction-amount ${tx.type}">${amountFormatted}</div>
                            <button class="transaction-delete-btn" onclick="App.confirmDeleteTransaction('${tx.id}')">
                                <i data-feather="trash-2"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        html += `
            </div>
            
            <p style="text-align: center; color: var(--text-secondary); font-size: 11px; margin-top: 24px; padding: 0 16px; margin-bottom: 40px;">
                * Quỹ lương nhân sự được cập nhật và liên kết tự động trực tiếp từ cơ sở dữ liệu Nhân sự để tính toán Labor Cost của doanh nghiệp.
            </p>
        `;

        container.innerHTML = html;
        feather.replace();
        
        // Register events for filters inside finance tab
        App.bindFinanceEvents();
    },

    // ==========================================
    // 8. RENDER TRANSACTION FORM (THÊM / SỬA GIAO DỊCH)
    // ==========================================
    renderTransactionForm(tx, container) {
        const isEdit = tx !== null;
        const defaultId = `TX-${Math.floor(100 + Math.random() * 900)}`;
        
        const data = isEdit ? tx : {
            id: defaultId,
            title: "",
            amount: "",
            type: "expense",
            category: "Giá vốn nguyên liệu",
            department: "Dạ Lan Center",
            date: new Date().toISOString().substring(0, 10),
            notes: ""
        };

        let html = `
            <form id="transaction-detail-form" onsubmit="event.preventDefault();">
                
                <div class="form-section-title">Thông tin giao dịch sổ quỹ</div>
                <div class="form-group-card">
                    <!-- ID (Readonly) -->
                    <div class="form-row">
                        <label for="form-tx-id">Mã Giao dịch</label>
                        <input type="text" id="form-tx-id" value="${data.id}" placeholder="VD: TX-123" readonly style="color:var(--text-secondary);">
                    </div>
                    <!-- Title -->
                    <div class="form-row">
                        <label for="form-tx-title">Tên khoản thu chi</label>
                        <input type="text" id="form-tx-title" value="${data.title}" placeholder="Nhập tên hoặc nội dung giao dịch" required>
                    </div>
                    <!-- Amount -->
                    <div class="form-row">
                        <label for="form-tx-amount">Số tiền (đ)</label>
                        <input type="number" id="form-tx-amount" value="${data.amount}" placeholder="Nhập số tiền VNĐ" required>
                    </div>
                    <!-- Date -->
                    <div class="form-row">
                        <label for="form-tx-date">Ngày giao dịch</label>
                        <input type="date" id="form-tx-date" value="${data.date}" required>
                    </div>
                </div>

                <div class="form-section-title">Phân loại & Đơn vị hạch toán</div>
                <div class="form-group-card">
                    <!-- Department -->
                    <div class="form-row">
                        <label for="form-tx-dept">Đơn vị hạch toán</label>
                        <select id="form-tx-dept" required>
                            ${DaLanStore.DEPARTMENTS.map(dept => `
                                <option value="${dept}" ${data.department === dept ? 'selected' : ''}>${dept}</option>
                            `).join('')}
                        </select>
                    </div>
                    <!-- Type (Income / Expense) -->
                    <div class="form-row">
                        <label for="form-tx-type">Loại giao dịch</label>
                        <select id="form-tx-type" required>
                            <option value="expense" ${data.type === "expense" ? 'selected' : ''}>Khoản Chi (-)</option>
                            <option value="income" ${data.type === "income" ? 'selected' : ''}>Khoản Thu (+)</option>
                        </select>
                    </div>
                    <!-- Category -->
                    <div class="form-row">
                        <label for="form-tx-category">Hạng mục tài chính</label>
                        <select id="form-tx-category" required>
                            <option value="Giá vốn nguyên liệu" ${data.category === "Giá vốn nguyên liệu" ? 'selected' : ''}>Giá vốn nguyên liệu (F&B)</option>
                            <option value="Chi phí vận hành" ${data.category === "Chi phí vận hành" ? 'selected' : ''}>Chi phí vận hành (OpEx)</option>
                            <option value="Doanh thu" ${data.category === "Doanh thu" ? 'selected' : ''}>Doanh thu gộp</option>
                            <option value="Khác" ${data.category === "Khác" ? 'selected' : ''}>Khác</option>
                        </select>
                    </div>
                </div>

                <div class="form-section-title">Ghi chú & Chi tiết hóa đơn</div>
                <div class="form-group-card">
                    <!-- Notes -->
                    <div class="form-row" style="align-items: flex-start; height: auto;">
                        <label for="form-tx-notes" style="margin-top: 4px;">Ghi chú</label>
                        <textarea id="form-tx-notes" rows="3" placeholder="Ghi chú chi tiết hóa đơn hoặc bên thứ ba..." style="resize:none; padding-top:4px;">${data.notes || ''}</textarea>
                    </div>
                </div>
            </form>
        `;

        container.innerHTML = html;
        feather.replace();

        // Listen for type changes to auto-select appropriate category
        const typeSelect = document.getElementById("form-tx-type");
        const catSelect = document.getElementById("form-tx-category");
        if (typeSelect && catSelect && !isEdit) {
            typeSelect.addEventListener("change", function() {
                if (this.value === "income") {
                    catSelect.value = "Doanh thu";
                } else {
                    catSelect.value = "Giá vốn nguyên liệu";
                }
            });
        }
    },

    // ==========================================
    // 9. RENDER CUSTOMER ORDER MENU PORTAL
    // ==========================================
    renderCustomerOrderPortal(container, activeCategory = "Tất cả", searchQuery = "") {
        const menu = DaLanStore.FOOD_MENU;
        const categories = ["Tất cả", "Khai vị", "Món chính", "Đồ uống", "Tráng miệng"];
        const categoryEmojis = { 'Tất cả': '🍽️', 'Khai vị': '🥗', 'Món chính': '🍲', 'Đồ uống': '🥤', 'Tráng miệng': '🍮' };
        const categoryGradients = {
            'Khai vị':    'linear-gradient(135deg,#E8F5E9,#C8E6C9)',
            'Món chính':  'linear-gradient(135deg,#FFEBEE,#FFCDD2)',
            'Đồ uống':    'linear-gradient(135deg,#E3F2FD,#BBDEFB)',
            'Tráng miệng':'linear-gradient(135deg,#F3E5F5,#E1BEE7)',
            'Tất cả':     'linear-gradient(135deg,#ECEFF1,#CFD8DC)'
        };
        
        // Ensure cart state is initialized
        if (!App.cart) App.cart = {};
        if (!App.customerUnit) App.customerUnit = "Dạ Lan Center";
        if (!App.customerTable) App.customerTable = "Bàn 01";
        
        // Filter menu items
        const filteredMenu = menu.filter(item => {
            const matchesCategory = activeCategory === "Tất cả" || item.category === activeCategory;
            const matchesSearch = searchQuery.trim() === "" || 
                                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  item.desc.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        // Get customer's active orders (pending or preparing) from local storage
        const allOrders = DaLanStore.getOrders();
        const activeOrders = allOrders.filter(o => 
            o.unit === App.customerUnit && 
            o.table === App.customerTable && 
            (o.status === "pending" || o.status === "preparing")
        );

        let html = `
            <!-- Customer Portal Premium Banner -->
            <div class="customer-portal-header" style="background: linear-gradient(135deg, var(--ios-red) 0%, #FF8A80 100%); padding: 20px 16px; border-radius: 0 0 20px 20px; color: white; margin-top: -16px; margin-left: -16px; margin-right: -16px; margin-bottom: 16px; box-shadow: 0 4px 15px rgba(211, 47, 47, 0.2);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="background:white; color:var(--ios-red); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-family:'Outfit', sans-serif;">DL</div>
                        <div>
                            <h2 style="font-family:'Outfit', sans-serif; font-size:18px; font-weight:800; margin:0;">Nhà Hàng Dạ Lan</h2>
                            <span style="font-size:11px; opacity:0.9;">Hệ Thống Thực Đơn Gọi Món Số Hóa</span>
                        </div>
                    </div>
                    <button onclick="App.exitCustomerMode()" style="background:rgba(255,255,255,0.2); border:none; color:white; font-size:11px; padding:6px 12px; border-radius:20px; font-weight:700; cursor:pointer;">
                        Thoát Demo (Về Admin)
                    </button>
                </div>
                
                <!-- Table Details Selector inside Header -->
                <div style="background:rgba(255,255,255,0.15); backdrop-filter:blur(5px); border-radius:12px; padding:10px; margin-top:14px; display:flex; gap:10px; align-items:center;">
                    <div style="flex: 2;">
                        <label style="font-size:9px; text-transform:uppercase; font-weight:700; opacity:0.8; display:block; margin-bottom:2px;">Đơn vị phục vụ</label>
                        <select id="cust-unit-select" onchange="App.setCustomerUnit(this.value)" style="width:100%; background:none; border:none; color:white; font-size:13px; font-weight:700; outline:none; cursor:pointer;">
                            <option value="Dạ Lan Center" ${App.customerUnit === "Dạ Lan Center" ? 'selected' : ''} style="color:var(--text-primary);">Dạ Lan Center</option>
                            <option value="Dạ Lan Star" ${App.customerUnit === "Dạ Lan Star" ? 'selected' : ''} style="color:var(--text-primary);">Dạ Lan Star</option>
                            <option value="Dạ Lan Event" ${App.customerUnit === "Dạ Lan Event" ? 'selected' : ''} style="color:var(--text-primary);">Dạ Lan Event</option>
                            <option value="Nhà máy Dạ Lan" ${App.customerUnit === "Nhà máy Dạ Lan" ? 'selected' : ''} style="color:var(--text-primary);">Nhà máy Dạ Lan</option>
                        </select>
                    </div>
                    <div style="width: 1px; background-color: rgba(255,255,255,0.3); height:24px;"></div>
                    <div style="flex: 1;">
                        <label style="font-size:9px; text-transform:uppercase; font-weight:700; opacity:0.8; display:block; margin-bottom:2px;">Vị trí bàn</label>
                        <input type="text" id="cust-table-input" value="${App.customerTable}" onchange="App.setCustomerTable(this.value)" placeholder="Bàn số" style="width:100%; background:none; border:none; color:white; font-size:13px; font-weight:700; outline:none; font-family: inherit;">
                    </div>
                </div>
            </div>

            <!-- Customer Order Tracking Section (if has active orders) -->
            ${activeOrders.length > 0 ? `
                <div class="ios-card order-tracker-card" style="border:1.5px solid var(--ios-orange); background-color:rgba(255, 149, 0, 0.05); margin-bottom: 16px;">
                    <h3 style="font-family:'Outfit', sans-serif; font-size:14px; font-weight:700; color:var(--ios-orange); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                        <i data-feather="clock" style="width:16px;"></i> Đơn hàng đang phục vụ của bạn
                    </h3>
                    ${activeOrders.map(order => {
                        const isPending = order.status === "pending";
                        
                        return `
                            <div style="border-bottom: 1px solid var(--border-color); padding: 8px 0; font-size:12px;">
                                <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom:4px;">
                                    <span>Đơn ${order.id} (${order.table})</span>
                                    <span style="color:${isPending ? 'var(--ios-orange)' : 'var(--ios-green)'};">
                                        ${isPending ? 'Chờ xác nhận...' : 'Đang thực hiện...'}
                                    </span>
                                </div>
                                <div style="color:var(--text-secondary); margin-bottom:8px; max-height: 40px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    ${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                                </div>
                                
                                <!-- Progress steps -->
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; position:relative; padding: 0 10px;">
                                    <div style="position:absolute; left:20px; right:20px; top:12px; height:3px; background-color:var(--border-color); z-index:1;"></div>
                                    <div style="position:absolute; left:20px; width:${isPending ? '0%' : '50%'}; top:12px; height:3px; background-color:var(--ios-green); z-index:2; transition: width 0.4s ease;"></div>
                                    
                                    <div style="display:flex; flex-direction:column; align-items:center; z-index:3;">
                                        <div style="width:24px; height:24px; border-radius:50%; background-color:var(--ios-orange); color:white; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700;">1</div>
                                        <span style="font-size:9px; margin-top:4px; font-weight:600;">Chờ duyệt</span>
                                    </div>
                                    <div style="display:flex; flex-direction:column; align-items:center; z-index:3;">
                                        <div style="width:24px; height:24px; border-radius:50%; background-color:${!isPending ? 'var(--ios-green)' : 'var(--bg-secondary)'}; color:${!isPending ? 'white' : 'var(--text-secondary)'}; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700;">2</div>
                                        <span style="font-size:9px; margin-top:4px; font-weight:600;">Chế biến</span>
                                    </div>
                                    <div style="display:flex; flex-direction:column; align-items:center; z-index:3;">
                                        <div style="width:24px; height:24px; border-radius:50%; background-color:var(--bg-secondary); color:var(--text-secondary); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700;">3</div>
                                        <span style="font-size:9px; margin-top:4px; font-weight:600;">Bàn giao</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : ''}

            <!-- Search and Category Filters -->
            <div class="ios-search-bar-container" style="background-color: var(--bg-primary); z-index: 10;">
                <div class="ios-search-bar">
                    <i data-feather="search"></i>
                    <input type="text" id="menu-search-input" placeholder="Tìm tên món ăn, thức uống..." value="${searchQuery}">
                    ${searchQuery ? `<button id="menu-search-clear-btn" style="background:none; border:none; color:var(--text-tertiary); cursor:pointer;"><i data-feather="x-circle" style="width:16px;"></i></button>` : ''}
                </div>
                
                <!-- Category Pills -->
                <div class="menu-category-pills" id="menu-category-segment">
                    ${categories.map(cat => {
                        const emoji = categoryEmojis[cat] || '🍽️';
                        return `
                            <button class="segment-btn cat-pill ${activeCategory === cat ? 'active' : ''}" data-val="${cat}">
                                <span>${emoji}</span> ${cat}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        if (filteredMenu.length === 0) {
            html += `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary); background-color: var(--bg-secondary); border-radius: 12px; border: 1px dashed var(--border-color); margin-top: 10px; margin-bottom: 120px;">
                    <i data-feather="coffee" style="width: 36px; height: 36px; color: var(--text-tertiary); margin-bottom: 8px;"></i>
                    <p style="font-weight: 500;">Không tìm thấy món ăn nào phù hợp</p>
                </div>
            `;
        } else {
            html += `<div class="food-grid">`;
            filteredMenu.forEach(item => {
                const qty = App.cart[item.id] || 0;
                const grad = categoryGradients[item.category] || categoryGradients['Tất cả'];
                const em = categoryEmojis[item.category] || '🍽️';
                
                html += `
                    <div class="food-card-2col" style="animation: fadeInUp 0.4s ease;">
                        <div class="food-card-img" style="background: ${grad};">
                            ${em}
                        </div>
                        <div class="food-card-body">
                            <h4 class="food-card-name">${item.name}</h4>
                            <div class="food-card-price">${this.formatVND(item.price).replace('₫', 'đ')}</div>
                        </div>
                        <div class="food-card-actions">
                            ${qty === 0 ? `
                                <button class="food-add-btn" onclick="App.addToCart('${item.id}')">
                                    <i data-feather="plus" style="width:13px; height:13px;"></i> Thêm món
                                </button>
                            ` : `
                                <div class="food-qty-counter">
                                    <button class="food-qty-btn minus" onclick="App.updateCartQty('${item.id}', -1)">−</button>
                                    <span class="food-qty-num">${qty}</span>
                                    <button class="food-qty-btn plus" onclick="App.updateCartQty('${item.id}', 1)">+</button>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        html += `
            <!-- Sticky Floating Cart Bar -->
            ${App.getCartTotalQuantity() > 0 ? `
                <div class="floating-cart-bar" onclick="App.openCartSummary()">
                    <div style="display:flex; align-items:center;">
                        <div class="cart-icon-wrap">
                            <i data-feather="shopping-cart" style="width:20px; color:white;"></i>
                            <span class="cart-badge">${App.getCartTotalQuantity()}</span>
                        </div>
                        <div class="cart-info">
                            <span class="cart-total">${this.formatVND(App.getCartTotalPrice()).replace('₫', 'đ')}</span>
                            <span class="cart-sub">${App.customerTable} • ${App.customerUnit}</span>
                        </div>
                    </div>
                    <button class="cart-cta-btn">
                        Xem giỏ hàng <i data-feather="chevron-right" style="width:16px;"></i>
                    </button>
                </div>
            ` : ''}
        `;

        container.innerHTML = html;
        feather.replace();
        
        // Bind customer menu events (search, segment change)
        App.bindCustomerMenuEvents();
    },

    // ==========================================
    // 10. RENDER STAFF ORDER QUEUE (BAN KHÁNH / NHÀ BẾP)
    // ==========================================
    renderOrderQueue(container, statusFilter = "Tất cả", unitFilter = "Tất cả") {
        const orders = DaLanStore.getOrders();
        const now = Date.now();

        // Helper: elapsed minutes
        function elapsedMin(ts) {
            return Math.floor((now - new Date(ts).getTime()) / 60000);
        }

        // Split orders into 3 kanban columns (all orders, unaffected by filter but filter hides cards)
        const pendingOrders  = orders.filter(o => o.status === 'pending');
        const prepOrders     = orders.filter(o => o.status === 'preparing');
        const doneOrders     = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

        // Helper: should card be visible under current filters
        function isVisible(o) {
            const matchesStatus = statusFilter === 'Tất cả' || o.status === statusFilter;
            const matchesUnit   = unitFilter   === 'Tất cả' || o.unit   === unitFilter;
            return matchesStatus && matchesUnit;
        }

        // Build a kanban card
        const buildCard = (order) => {
            const elapsed = elapsedMin(order.timestamp);
            const isUrgent = elapsed > 10;
            const display = isVisible(order) ? '' : 'display:none;';
            const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

            let actionBtns = '';
            if (order.status === 'pending') {
                actionBtns = `
                    <button class="kanban-action-btn cancel" onclick="App.changeOrderStatus('${order.id}','cancelled')">Hủy</button>
                    <button class="kanban-action-btn prep" onclick="App.changeOrderStatus('${order.id}','preparing')">Chuẩn Bị</button>
                `;
            } else if (order.status === 'preparing') {
                actionBtns = `
                    <button class="kanban-action-btn cancel" onclick="App.changeOrderStatus('${order.id}','cancelled')">Hủy</button>
                    <button class="kanban-action-btn done" onclick="App.changeOrderStatus('${order.id}','completed')">
                        <i data-feather="check-circle" style="width:12px;"></i> Hoàn Tất &amp; Thu Tiền
                    </button>
                `;
            } else {
                actionBtns = `<button class="kanban-action-btn delete" onclick="App.deleteOrderLog('${order.id}')"><i data-feather="trash-2" style="width:13px;"></i> Xóa</button>`;
            }

            return `
                <div class="order-kcard" style="${display}">
                    <div class="order-kcard-header">
                        <span class="order-kcard-id">${order.id}</span>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span class="order-kcard-table">${order.table}</span>
                            <span class="order-elapsed${isUrgent ? ' urgent' : ''}">${elapsed}ph</span>
                        </div>
                    </div>
                    <div style="font-size:10px; color:var(--text-secondary); margin-bottom:8px; font-weight:500;">${order.unit}</div>
                    <div class="order-kcard-items">
                        ${order.items.map(item => `
                            <div class="order-kcard-item">
                                <span class="order-kcard-item-name">${item.name}</span>
                                <span class="order-kcard-item-qty">x${item.quantity}</span>
                            </div>
                            ${item.notes ? `<div class="order-kcard-note"><i data-feather="edit-3" style="width:10px;"></i> ${item.notes}</div>` : ''}
                        `).join('')}
                    </div>
                    ${order.notes ? `<div class="order-kcard-note" style="margin-top:4px;"><i data-feather="message-circle" style="width:10px;"></i> ${order.notes}</div>` : ''}
                    <div class="order-kcard-footer">
                        <span class="order-kcard-total">${this.formatVND(total).replace('₫','đ')}</span>
                        <div style="display:flex; gap:6px;">${actionBtns}</div>
                    </div>
                </div>
            `;
        };

        // Build full HTML
        let html = `
            <div style="padding-bottom:30px;">
                <!-- Filter row -->
                <div style="display:flex; gap:10px; margin-bottom:14px; align-items:center;">
                    <div style="flex:1;">
                        <select id="queue-unit-filter" onchange="App.setQueueFilters()" style="width:100%; background:var(--bg-card); border:1px solid var(--border-color); border-radius:10px; padding:8px 12px; color:var(--text-primary); font-size:12px; font-weight:600; outline:none; cursor:pointer;">
                            <option value="Tất cả" ${unitFilter === 'Tất cả' ? 'selected' : ''}>🏢 Tất cả Đơn vị</option>
                            <option value="Dạ Lan Center" ${unitFilter === 'Dạ Lan Center' ? 'selected' : ''}>Dạ Lan Center</option>
                            <option value="Dạ Lan Star" ${unitFilter === 'Dạ Lan Star' ? 'selected' : ''}>Dạ Lan Star</option>
                            <option value="Dạ Lan Event" ${unitFilter === 'Dạ Lan Event' ? 'selected' : ''}>Dạ Lan Event</option>
                            <option value="Nhà máy Dạ Lan" ${unitFilter === 'Nhà máy Dạ Lan' ? 'selected' : ''}>Nhà máy Dạ Lan</option>
                        </select>
                    </div>
                    <div style="flex:1;">
                        <select id="queue-status-filter" onchange="App.setQueueFilters()" style="width:100%; background:var(--bg-card); border:1px solid var(--border-color); border-radius:10px; padding:8px 12px; color:var(--text-primary); font-size:12px; font-weight:600; outline:none; cursor:pointer;">
                            <option value="Tất cả" ${statusFilter === 'Tất cả' ? 'selected' : ''}>📋 Tất cả Trạng thái</option>
                            <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>⏳ Chờ duyệt</option>
                            <option value="preparing" ${statusFilter === 'preparing' ? 'selected' : ''}>🔥 Đang chuẩn bị</option>
                            <option value="completed" ${statusFilter === 'completed' ? 'selected' : ''}>✅ Hoàn thành</option>
                            <option value="cancelled" ${statusFilter === 'cancelled' ? 'selected' : ''}>❌ Đã hủy</option>
                        </select>
                    </div>
                </div>

                <!-- Kanban Board -->
                <div class="kanban-board">

                    <!-- Column: Pending -->
                    <div class="kanban-col kanban-col-pending">
                        <div class="kanban-col-header">
                            <span class="kanban-col-title">⏳ Chờ duyệt</span>
                            <span class="kanban-col-count">${pendingOrders.length}</span>
                        </div>
                        <div class="kanban-col-body">
                            ${pendingOrders.length === 0 ? `<div style="text-align:center; padding:20px; color:var(--text-tertiary); font-size:12px;">Không có đơn</div>` : pendingOrders.map(o => buildCard(o)).join('')}
                        </div>
                    </div>

                    <!-- Column: Preparing -->
                    <div class="kanban-col kanban-col-prep">
                        <div class="kanban-col-header">
                            <span class="kanban-col-title">🔥 Đang chuẩn bị</span>
                            <span class="kanban-col-count">${prepOrders.length}</span>
                        </div>
                        <div class="kanban-col-body">
                            ${prepOrders.length === 0 ? `<div style="text-align:center; padding:20px; color:var(--text-tertiary); font-size:12px;">Không có đơn</div>` : prepOrders.map(o => buildCard(o)).join('')}
                        </div>
                    </div>

                    <!-- Column: Done / Cancelled -->
                    <div class="kanban-col kanban-col-done">
                        <div class="kanban-col-header">
                            <span class="kanban-col-title">✅ Hoàn thành</span>
                            <span class="kanban-col-count">${doneOrders.length}</span>
                        </div>
                        <div class="kanban-col-body">
                            ${doneOrders.length === 0 ? `<div style="text-align:center; padding:20px; color:var(--text-tertiary); font-size:12px;">Không có đơn</div>` : doneOrders.map(o => buildCard(o)).join('')}
                        </div>
                    </div>

                </div>
            </div>
        `;

        container.innerHTML = html;
        feather.replace();
    }
};
