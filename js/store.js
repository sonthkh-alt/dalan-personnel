/* ----------------------------------------------------
   DA LAN PERSONNEL MANAGEMENT SYSTEM - DATA STORE
   Handles LocalStorage synchronization and CRUD operations
------------------------------------------------------- */

const DaLanStore = {
    // 5 Default units/departments
    DEPARTMENTS: [
        "Văn phòng",
        "Dạ Lan Center",
        "Dạ Lan Star",
        "Dạ Lan Event",
        "Nhà máy Dạ Lan"
    ],

    // Default Professional Mock Data
    MOCK_EMPLOYEES: [
        // --- Ban Giám Đốc (HQ) ---
        {
            id: "DL-001",
            name: "Nguyễn Thị Hồng Liên",
            role: "Giám đốc",
            department: "Văn phòng",
            phone: "0905123456",
            email: "nguyenhonglien@dalan.com.vn",
            cccd: "038187012345",
            joinDate: "2010-01-15",
            insuranceStatus: "Đã đóng",
            salary: 55000000,
            status: "working",
            avatar: "",
            notes: "Giám đốc điều hành Công ty cổ phần Dạ Lan, sinh năm 1987."
        },
        {
            id: "DL-002",
            name: "Trần Thị Dạ Hương",
            role: "Phó Giám đốc Vận hành",
            department: "Văn phòng",
            phone: "0905123457",
            email: "trandahuong@dalan.com.vn",
            cccd: "038092004567",
            joinDate: "2012-05-20",
            insuranceStatus: "Đã đóng",
            salary: 40000000,
            status: "working",
            avatar: "",
            notes: "Phụ trách vận hành chuỗi Dạ Lan Center, Dạ Lan Star và Dạ Lan Event."
        },
        {
            id: "DL-003",
            name: "Lê Văn Hoàng",
            role: "Phó Giám đốc Kinh doanh",
            department: "Văn phòng",
            phone: "0905123458",
            email: "levanhoang@dalan.com.vn",
            cccd: "038091008912",
            joinDate: "2013-09-01",
            insuranceStatus: "Đã đóng",
            salary: 38000000,
            status: "working",
            avatar: "",
            notes: "Phụ trách chiến lược kinh doanh, marketing và khối nhà máy."
        },

        // --- 1. Văn Phòng ---
        {
            id: "DL-004",
            name: "Phạm Minh Đức",
            role: "Quản lý trưởng",
            department: "Văn phòng",
            phone: "0914987654",
            email: "phamminhduc@dalan.com.vn",
            cccd: "038095015382",
            joinDate: "2015-03-10",
            insuranceStatus: "Đã đóng",
            salary: 22000000,
            status: "working",
            avatar: "",
            notes: "Quản lý hành chính và nhân sự khối Văn phòng."
        },
        {
            id: "DL-005",
            name: "Nguyễn Thị Thảo",
            role: "Kế toán trưởng",
            department: "Văn phòng",
            phone: "0982736451",
            email: "nguyenthithao@dalan.com.vn",
            cccd: "038194002931",
            joinDate: "2015-06-01",
            insuranceStatus: "Đã đóng",
            salary: 20000000,
            status: "working",
            avatar: "",
            notes: "Phụ trách tài chính, kế toán tổng hợp toàn công ty."
        },
        {
            id: "DL-006",
            name: "Hoàng Lan Anh",
            role: "Nhân viên Hành chính",
            department: "Văn phòng",
            phone: "0934112233",
            email: "hoanglananh@dalan.com.vn",
            cccd: "038198007421",
            joinDate: "2020-11-15",
            insuranceStatus: "Đã đóng",
            salary: 10000000,
            status: "working",
            avatar: "",
            notes: "Thư ký văn phòng, hỗ trợ lưu trữ hồ sơ và tiếp đón khách."
        },

        // --- 2. Dạ Lan Center ---
        {
            id: "DL-007",
            name: "Bùi Quang Hải",
            role: "Quản lý trưởng",
            department: "Dạ Lan Center",
            phone: "0976543210",
            email: "buiquanghai@dalan.com.vn",
            cccd: "038089006521",
            joinDate: "2014-04-18",
            insuranceStatus: "Đã đóng",
            salary: 25000000,
            status: "working",
            avatar: "",
            notes: "Điều hành hoạt động ẩm thực và dịch vụ tại Dạ Lan Center."
        },
        {
            id: "DL-008",
            name: "Nguyễn Quốc Tuấn",
            role: "Bếp trưởng",
            department: "Dạ Lan Center",
            phone: "0915667788",
            email: "nguyenquoctuan@dalan.com.vn",
            cccd: "038085009182",
            joinDate: "2014-05-01",
            insuranceStatus: "Đã đóng",
            salary: 22000000,
            status: "working",
            avatar: "",
            notes: "Bếp trưởng điều hành, phụ trách thực đơn và chất lượng món ăn."
        },
        {
            id: "DL-009",
            name: "Lê Minh Châu",
            role: "Nhân viên Phục vụ",
            department: "Dạ Lan Center",
            phone: "0944889900",
            email: "leminhchau@dalan.com.vn",
            cccd: "038199010293",
            joinDate: "2022-02-15",
            insuranceStatus: "Đã đóng",
            salary: 8000000,
            status: "working",
            avatar: "",
            notes: "Nhân viên phục vụ bàn xuất sắc, luôn nhiệt tình với khách hàng."
        },
        {
            id: "DL-010",
            name: "Vũ Hoàng Nam",
            role: "Nhân viên Phục vụ",
            department: "Dạ Lan Center",
            phone: "0966778899",
            email: "vuhoangnam@dalan.com.vn",
            cccd: "038101011823",
            joinDate: "2023-01-10",
            insuranceStatus: "Tự nguyện",
            salary: 7500000,
            status: "probation",
            avatar: "",
            notes: "Nhân viên thử việc nhiệt huyết, đang đào tạo nghiệp vụ nhà hàng."
        },

        // --- 3. Dạ Lan Star ---
        {
            id: "DL-011",
            name: "Đặng Hồng Sơn",
            role: "Quản lý trưởng",
            department: "Dạ Lan Star",
            phone: "0909223344",
            email: "danghongson@dalan.com.vn",
            cccd: "038088012741",
            joinDate: "2016-02-01",
            insuranceStatus: "Đã đóng",
            salary: 24000000,
            status: "working",
            avatar: "",
            notes: "Quản lý tổ hợp giải trí, cafe và khách sạn Dạ Lan Star."
        },
        {
            id: "DL-012",
            name: "Trịnh Thu Trang",
            role: "Trưởng quầy Bar",
            department: "Dạ Lan Star",
            phone: "0988665544",
            email: "trinhthutrang@dalan.com.vn",
            cccd: "038195006734",
            joinDate: "2017-08-15",
            insuranceStatus: "Đã đóng",
            salary: 14000000,
            status: "working",
            avatar: "",
            notes: "Pha chế trưởng, chịu trách nhiệm sáng tạo đồ uống và quản lý quầy bar."
        },
        {
            id: "DL-013",
            name: "Đỗ Hữu Đạt",
            role: "Nhân viên Phục vụ",
            department: "Dạ Lan Star",
            phone: "0933445566",
            email: "dohuudat@dalan.com.vn",
            cccd: "038197004921",
            joinDate: "2021-05-10",
            insuranceStatus: "Đã đóng",
            salary: 8000000,
            status: "leave",
            notes: "Nghỉ phép chế độ gia đình từ ngày 15/5 đến 25/5."
        },

        // --- 4. Dạ Lan Event ---
        {
            id: "DL-014",
            name: "Nguyễn Thanh Lâm",
            role: "Quản lý trưởng",
            department: "Dạ Lan Event",
            phone: "0912334455",
            email: "nguyenthanhlam@dalan.com.vn",
            cccd: "038090003824",
            joinDate: "2016-10-10",
            insuranceStatus: "Đã đóng",
            salary: 26000000,
            status: "working",
            avatar: "",
            notes: "Điều hành khối sự kiện, hội nghị và tiệc cưới Dạ Lan Event."
        },
        {
            id: "DL-015",
            name: "Mai Xuân Trường",
            role: "Kỹ thuật viên Âm thanh",
            department: "Dạ Lan Event",
            phone: "0977228833",
            email: "maixuantruong@dalan.com.vn",
            cccd: "038092004561",
            joinDate: "2018-03-01",
            insuranceStatus: "Đã đóng",
            salary: 13000000,
            status: "working",
            avatar: "",
            notes: "Phụ trách hệ thống âm thanh, ánh sáng chuyên nghiệp cho các sự kiện."
        },
        {
            id: "DL-016",
            name: "Phan Đình Phùng",
            role: "Nhân viên Setup Sự kiện",
            department: "Dạ Lan Event",
            phone: "0944332211",
            email: "phandinhphung@dalan.com.vn",
            cccd: "038198003921",
            joinDate: "2022-07-20",
            insuranceStatus: "Chưa đóng",
            salary: 8500000,
            status: "working",
            avatar: "",
            notes: "Hỗ trợ thiết kế, dựng sân khấu và quản lý đạo cụ sự kiện."
        },

        // --- 5. Nhà máy Dạ Lan ---
        {
            id: "DL-017",
            name: "Ngô Quốc Khánh",
            role: "Quản lý trưởng",
            department: "Nhà máy Dạ Lan",
            phone: "0903445566",
            email: "ngoquockhanh@dalan.com.vn",
            cccd: "038084008291",
            joinDate: "2011-12-01",
            insuranceStatus: "Đã đóng",
            salary: 28000000,
            status: "working",
            avatar: "",
            notes: "Giám đốc nhà máy sản xuất bánh kẹo và thực phẩm chế biến Dạ Lan."
        },
        {
            id: "DL-018",
            name: "Đỗ Văn Hùng",
            role: "Tổ trưởng Sản xuất",
            department: "Nhà máy Dạ Lan",
            phone: "0989112233",
            email: "dovanhung@dalan.com.vn",
            cccd: "038086001293",
            joinDate: "2013-05-15",
            insuranceStatus: "Đã đóng",
            salary: 15000000,
            status: "working",
            avatar: "",
            notes: "Quản lý dây chuyền đóng gói, giám sát an toàn lao động và kỹ thuật."
        },
        {
            id: "DL-019",
            name: "Bùi Thị Mai",
            role: "Công nhân Sản xuất",
            department: "Nhà máy Dạ Lan",
            phone: "0965334455",
            email: "buithimai@dalan.com.vn",
            cccd: "038191003492",
            joinDate: "2015-08-01",
            insuranceStatus: "Đã đóng",
            salary: 9000000,
            status: "working",
            avatar: "",
            notes: "Nhân sự thâm niên dây chuyền chế biến, luôn đạt năng suất cao."
        },
        {
            id: "DL-020",
            name: "Trần Văn Tùng",
            role: "Công nhân Sản xuất",
            department: "Nhà máy Dạ Lan",
            phone: "0971556677",
            email: "tranvantung@dalan.com.vn",
            cccd: "038198005381",
            joinDate: "2023-04-01",
            insuranceStatus: "Chưa đóng",
            salary: 7500000,
            status: "probation",
            avatar: "",
            notes: "Nhân viên thử việc, tinh thần kỷ luật tốt, đang học việc vận hành máy."
        }
    ],

    // --- Core Store Functions ---
    init() {
        const stored = localStorage.getItem("dalan_employees");
        if (!stored) {
            this.resetToMockData();
        } else {
            try {
                const emps = JSON.parse(stored);
                const dir = emps.find(e => e.id === "DL-001");
                if (dir && dir.name === "Nguyễn Dạ Lan") {
                    dir.name = "Nguyễn Thị Hồng Liên";
                    dir.cccd = "038187012345";
                    dir.email = "nguyenhonglien@dalan.com.vn";
                    dir.notes = "Giám đốc điều hành Công ty cổ phần Dạ Lan, sinh năm 1987.";
                    this.saveEmployees(emps);
                }
            } catch(e) {}
        }
    },

    getEmployees() {
        this.init();
        return JSON.parse(localStorage.getItem("dalan_employees"));
    },

    saveEmployees(employees) {
        localStorage.setItem("dalan_employees", JSON.stringify(employees));
    },

    addEmployee(emp) {
        const employees = this.getEmployees();
        employees.push(emp);
        this.saveEmployees(employees);
        return true;
    },

    updateEmployee(id, updatedEmp) {
        const employees = this.getEmployees();
        const index = employees.findIndex(e => e.id === id);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...updatedEmp };
            this.saveEmployees(employees);
            return true;
        }
        return false;
    },

    deleteEmployee(id) {
        const employees = this.getEmployees();
        const filtered = employees.filter(e => e.id !== id);
        if (filtered.length !== employees.length) {
            this.saveEmployees(filtered);
            return true;
        }
        return false;
    },

    resetToMockData() {
        this.saveEmployees(this.MOCK_EMPLOYEES);
    },

    // --- Utility: Generate Gradient Initials Avatar ---
    getInitials(name) {
        if (!name) return "DL";
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
        return (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase();
    },

    // --- Dynamic Statistics Calculations ---
    getStats() {
        const employees = this.getEmployees();
        const total = employees.length;
        
        // Count per department
        const deptCounts = {};
        this.DEPARTMENTS.forEach(dept => {
            deptCounts[dept] = 0;
        });
        
        employees.forEach(e => {
            if (deptCounts[e.department] !== undefined) {
                deptCounts[e.department]++;
            } else {
                deptCounts[e.department] = 1;
            }
        });

        // Count per status
        let working = 0;
        let leave = 0;
        let probation = 0;
        
        employees.forEach(e => {
            if (e.status === "working") working++;
            else if (e.status === "leave") leave++;
            else if (e.status === "probation") probation++;
        });

        // Total and average salary
        let totalSalary = 0;
        employees.forEach(e => {
            totalSalary += (Number(e.salary) || 0);
        });
        const avgSalary = total > 0 ? Math.round(totalSalary / total) : 0;

        // Insurance stats
        let insured = 0;
        let notInsured = 0;
        let voluntary = 0;
        employees.forEach(e => {
            if (e.insuranceStatus === "Đã đóng") insured++;
            else if (e.insuranceStatus === "Chưa đóng") notInsured++;
            else if (e.insuranceStatus === "Tự nguyện") voluntary++;
        });

        return {
            total,
            deptCounts,
            status: { working, leave, probation },
            avgSalary,
            totalSalary,
            insurance: { insured, notInsured, voluntary }
        };
    },

    // --- Import / Export Backup ---
    exportData() {
        const dataStr = JSON.stringify(this.getEmployees(), null, 2);
        return "data:text/json;charset=utf-8," + encodeURIComponent(dataStr);
    },

    importData(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
                this.saveEmployees(parsed);
                return { success: true, count: parsed.length };
            }
            return { success: false, error: "Định dạng file không đúng!" };
        } catch (e) {
            return { success: false, error: "Dữ liệu JSON không hợp lệ!" };
        }
    }
};

// Initialize store instantly on load
DaLanStore.init();
