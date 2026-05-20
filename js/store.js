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

    // Food & Drink Menu (Dạ Lan Digital Menu)
    FOOD_MENU: [
        { id: "FOOD-001", name: "Phở Đặc Biệt Dạ Lan", price: 65000, category: "Món chính", desc: "Phở bò truyền thống với nạm, gầu, gân, bò viên thượng hạng.", icon: "coffee" },
        { id: "FOOD-002", name: "Lẩu Bò Thập Cẩm Dạ Lan", price: 350000, category: "Món chính", desc: "Lẩu bò nhúng giấm thơm nồng, nước lẩu ngọt thanh kèm rau nấm tươi.", icon: "zap" },
        { id: "FOOD-003", name: "Chả Giò Dạ Lan Giòn Rụm", price: 85000, category: "Khai vị", desc: "Nhân thịt tôm cua đặc sản bánh tráng giòn rụm rán vàng.", icon: "award" },
        { id: "FOOD-004", name: "Gỏi Ngó Sen Tôm Thịt", price: 120000, category: "Khai vị", desc: "Gỏi chua ngọt nhẹ nhàng, tôm thịt thơm ngọt ăn kèm bánh phồng tôm.", icon: "sun" },
        { id: "FOOD-005", name: "Cơm Chiên Hải Sản Hoàng Kim", price: 145000, category: "Món chính", desc: "Cơm rang tơi xốp, hạt cơm bọc trứng muối thơm bùi đầy ắp hải sản.", icon: "database" },
        { id: "FOOD-006", name: "Bò Né Bản Gang Dạ Lan", price: 180000, category: "Món chính", desc: "Thịt bò Mỹ nhập khẩu mềm thơm cháy cạnh trên chảo gang nóng hổi.", icon: "target" },
        { id: "FOOD-007", name: "Cà Phê Sữa Đá Dạ Lan", price: 35000, category: "Đồ uống", desc: "Hạt cà phê Robusta Buôn Ma Thuột đậm đà, sữa đặc béo ngậy.", icon: "coffee" },
        { id: "FOOD-008", name: "Trà Sen Vàng Trân Châu", price: 45000, category: "Đồ uống", desc: "Trà oolong thanh mát, củ sen giòn sần sật bùi ngọt, trân châu hạt sen.", icon: "sunset" },
        { id: "FOOD-009", name: "Sinh Tố Dâu Đà Lạt", price: 55000, category: "Đồ uống", desc: "Dâu tây tươi Đà Lạt xay nhuyễn mát lạnh chua ngọt tự nhiên.", icon: "smile" },
        { id: "FOOD-010", name: "Chè Hạt Sen Nhãn Nhục", price: 40000, category: "Tráng miệng", desc: "Món tráng miệng thanh mát ngọt thanh, hạt sen ninh nhừ nhãn lồng giòn thơm.", icon: "moon" },
        { id: "FOOD-011", name: "Bánh Flan Caramel Macchiato", price: 30000, category: "Tráng miệng", desc: "Bánh flan béo ngậy mịn màng phủ xốt caramel cà phê thơm nồng.", icon: "heart" }
    ],

    // Default Customer Orders
    MOCK_ORDERS: [
        {
            id: "ORD-001",
            table: "Bàn số 03",
            unit: "Dạ Lan Center",
            items: [
                { itemId: "FOOD-001", name: "Phở Đặc Biệt Dạ Lan", price: 65000, quantity: 2, notes: "1 tô không hành lá" },
                { itemId: "FOOD-007", name: "Cà Phê Sữa Đá Dạ Lan", price: 35000, quantity: 2, notes: "ít sữa" }
            ],
            totalAmount: 200000,
            status: "pending",
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            notes: "Khách gọi thêm ly nước lọc"
        },
        {
            id: "ORD-002",
            table: "Bàn số 12",
            unit: "Dạ Lan Star",
            items: [
                { itemId: "FOOD-002", name: "Lẩu Bò Thập Cẩm Dạ Lan", price: 350000, quantity: 1, notes: "" },
                { itemId: "FOOD-003", name: "Chả Giò Dạ Lan Giòn Rụm", price: 85000, quantity: 1, notes: "" },
                { itemId: "FOOD-008", name: "Trà Sen Vàng Trân Châu", price: 45000, quantity: 3, notes: "2 ly ít đường" }
            ],
            totalAmount: 570000,
            status: "preparing",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            notes: "Phục vụ nhanh giùm"
        },
        {
            id: "ORD-003",
            table: "Bàn số 05",
            unit: "Dạ Lan Center",
            items: [
                { itemId: "FOOD-005", name: "Cơm Chiên Hải Sản Hoàng Kim", price: 145000, quantity: 1, notes: "" },
                { itemId: "FOOD-010", name: "Chè Hạt Sen Nhãn Nhục", price: 40000, quantity: 1, notes: "" }
            ],
            totalAmount: 185000,
            status: "completed",
            timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
            notes: ""
        }
    ],

    // Default Professional F&B Transactions for May 2026
    MOCK_TRANSACTIONS: [
        {
            id: "TX-001",
            title: "Doanh thu Tiệc cưới Trọn gói Khách hàng Nguyễn Văn A",
            amount: 520000000,
            type: "income",
            category: "Doanh thu",
            department: "Dạ Lan Center",
            date: "2026-05-18",
            notes: "Thanh toán đợt 2 và quyết toán tiệc cưới 400 khách."
        },
        {
            id: "TX-002",
            title: "Nhập thực phẩm tươi sống tuần 3 Center",
            amount: 148000000,
            type: "expense",
            category: "Giá vốn nguyên liệu",
            department: "Dạ Lan Center",
            date: "2026-05-16",
            notes: "Rau củ quả tươi, hải sản, thịt gia cầm phục vụ nhà hàng."
        },
        {
            id: "TX-003",
            title: "Doanh thu sự kiện Gala Dinner Công ty X",
            amount: 350000000,
            type: "income",
            category: "Doanh thu",
            department: "Dạ Lan Event",
            date: "2026-05-15",
            notes: "Sự kiện Gala tiệc tối trọn gói âm thanh ánh sáng sân khấu."
        },
        {
            id: "TX-004",
            title: "Chi phí setup sân khấu & hoa tươi trang trí",
            amount: 98000000,
            type: "expense",
            category: "Giá vốn nguyên liệu",
            department: "Dạ Lan Event",
            date: "2026-05-14",
            notes: "Thuê màn hình LED, thiết kế backdrop và hoa tươi trang trí tiệc."
        },
        {
            id: "TX-005",
            title: "Doanh thu lưu trú khách sạn & Cafe Star",
            amount: 180000000,
            type: "income",
            category: "Doanh thu",
            department: "Dạ Lan Star",
            date: "2026-05-17",
            notes: "Doanh số bill gộp phòng lưu trú và cafe tổ hợp Star."
        },
        {
            id: "TX-006",
            title: "Chi phí nguyên liệu pha chế & cafe Star",
            amount: 45000000,
            type: "expense",
            category: "Giá vốn nguyên liệu",
            department: "Dạ Lan Star",
            date: "2026-05-12",
            notes: "Nhập hạt cafe Arabica, Robusta, sữa đặc, siro và hoa quả tươi."
        },
        {
            id: "TX-007",
            title: "Doanh số xuất xưởng lô bánh kẹo bánh trung thu sớm",
            amount: 410000000,
            type: "income",
            category: "Doanh thu",
            department: "Nhà máy Dạ Lan",
            date: "2026-05-19",
            notes: "Thanh toán giao hàng đợt 1 cho nhà phân phối bánh kẹo miền Bắc."
        },
        {
            id: "TX-008",
            title: "Nhập bột mỳ, đường kính sản xuất bánh",
            amount: 112000000,
            type: "expense",
            category: "Giá vốn nguyên liệu",
            department: "Nhà máy Dạ Lan",
            date: "2026-05-10",
            notes: "Mua nguyên liệu thô đường, bột mỳ hoa ngọc lan kho bãi nhà máy."
        },
        {
            id: "TX-009",
            title: "Tiền điện 3 pha và nước vận hành nhà máy tháng 5",
            amount: 32000000,
            type: "expense",
            category: "Chi phí vận hành",
            department: "Nhà máy Dạ Lan",
            date: "2026-05-15",
            notes: "Hóa đơn điện lực và nước sạch sản xuất công nghiệp."
        },
        {
            id: "TX-010",
            title: "Chi phí marketing quảng cáo thương hiệu Dạ Lan",
            amount: 20000000,
            type: "expense",
            category: "Chi phí vận hành",
            department: "Văn phòng",
            date: "2026-05-08",
            notes: "Tài trợ quảng bá hình ảnh truyền thông và chạy quảng cáo online."
        },
        {
            id: "TX-011",
            title: "Chi phí viễn thông & văn phòng phẩm HQ",
            amount: 15000000,
            type: "expense",
            category: "Chi phí vận hành",
            department: "Văn phòng",
            date: "2026-05-05",
            notes: "Chi mua văn phòng phẩm và internet cáp quang tổng công ty."
        },
        {
            id: "TX-012",
            title: "Doanh thu ẩm thực & Cafe lẻ tuần 3 Center",
            amount: 85000000,
            type: "income",
            category: "Doanh thu",
            department: "Dạ Lan Center",
            date: "2026-05-19",
            notes: "Doanh số bán lẻ tại quầy Center và nhà hàng."
        },
        {
            id: "TX-013",
            title: "Nhập bia, nước ngọt tháng 5 Center",
            amount: 25000000,
            type: "expense",
            category: "Giá vốn nguyên liệu",
            department: "Dạ Lan Center",
            date: "2026-05-06",
            notes: "Chi phí nhập đồ uống đóng chai nước ngọt ngọt có ga các loại."
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

        const storedTx = localStorage.getItem("dalan_transactions");
        if (!storedTx) {
            this.resetTransactionsToMockData();
        }

        const storedOrders = localStorage.getItem("dalan_orders");
        if (!storedOrders) {
            this.resetOrdersToMockData();
        }
    },

    getEmployees() {
        const stored = localStorage.getItem("dalan_employees");
        if (!stored) {
            this.resetToMockData();
            return this.MOCK_EMPLOYEES;
        }
        return JSON.parse(stored);
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

    // --- Transactions Store Functions ---
    getTransactions() {
        const stored = localStorage.getItem("dalan_transactions");
        if (!stored) {
            this.resetTransactionsToMockData();
            return this.MOCK_TRANSACTIONS;
        }
        return JSON.parse(stored);
    },

    saveTransactions(transactions) {
        localStorage.setItem("dalan_transactions", JSON.stringify(transactions));
    },

    addTransaction(tx) {
        const transactions = this.getTransactions();
        transactions.unshift(tx); // Add new transactions to the beginning
        this.saveTransactions(transactions);
        return true;
    },

    deleteTransaction(id) {
        const transactions = this.getTransactions();
        const filtered = transactions.filter(t => t.id !== id);
        if (filtered.length !== transactions.length) {
            this.saveTransactions(filtered);
            return true;
        }
        return false;
    },

    updateTransaction(id, updatedTx) {
        const transactions = this.getTransactions();
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            transactions[index] = { ...transactions[index], ...updatedTx };
            this.saveTransactions(transactions);
            return true;
        }
        return false;
    },

    resetTransactionsToMockData() {
        this.saveTransactions(this.MOCK_TRANSACTIONS);
    },

    // --- Orders Store Functions ---
    getOrders() {
        const stored = localStorage.getItem("dalan_orders");
        if (!stored) {
            this.resetOrdersToMockData();
            return this.MOCK_ORDERS;
        }
        return JSON.parse(stored);
    },

    saveOrders(orders) {
        localStorage.setItem("dalan_orders", JSON.stringify(orders));
    },

    addOrder(order) {
        const orders = this.getOrders();
        orders.unshift(order); // Add new orders to the beginning
        this.saveOrders(orders);
        return true;
    },

    deleteOrder(id) {
        const orders = this.getOrders();
        const filtered = orders.filter(o => o.id !== id);
        if (filtered.length !== orders.length) {
            this.saveOrders(filtered);
            return true;
        }
        return false;
    },

    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            const oldStatus = orders[index].status;
            orders[index].status = status;
            this.saveOrders(orders);

            // If transitioned to 'completed' and was not completed before, generate a transaction!
            if (status === 'completed' && oldStatus !== 'completed') {
                const order = orders[index];
                const orderNum = order.id.split('-')[1] || Math.floor(100 + Math.random() * 900);
                const txId = `TX-ORD-${orderNum}`;
                const tx = {
                    id: txId,
                    title: `Doanh thu đặt món - ${order.id} (${order.table})`,
                    amount: order.totalAmount,
                    type: "income",
                    category: "Doanh thu",
                    department: order.unit,
                    date: new Date().toISOString().substring(0, 10),
                    notes: `Đơn đặt món của khách hoàn thành tự động. Ghi chú: ${order.notes || 'Không có'}`
                };
                this.addTransaction(tx);
            }
            return true;
        }
        return false;
    },

    resetOrdersToMockData() {
        this.saveOrders(this.MOCK_ORDERS);
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

    // --- Dynamic F&B Financial Stats ---
    getFinancialStats() {
        const transactions = this.getTransactions();
        const stats = this.getStats();
        
        const laborCost = stats.totalSalary; // Dynamic labor cost from HR
        let totalRevenue = 0;
        let foodCost = 0;
        let opEx = 0;
        
        transactions.forEach(tx => {
            const amt = Number(tx.amount) || 0;
            if (tx.type === "income") {
                totalRevenue += amt;
            } else if (tx.type === "expense") {
                if (tx.category === "Giá vốn nguyên liệu") {
                    foodCost += amt;
                } else {
                    opEx += amt; // Operational costs (OpEx)
                }
            }
        });
        
        const totalExpenses = foodCost + laborCost + opEx;
        const netProfit = totalRevenue - totalExpenses;
        
        // Ratios (Avoid division by zero)
        const revForRatio = totalRevenue > 0 ? totalRevenue : 1;
        const primeCost = foodCost + laborCost;
        const primeCostPercent = (primeCost / revForRatio) * 100;
        const laborCostPercent = (laborCost / revForRatio) * 100;
        const foodCostPercent = (foodCost / revForRatio) * 100;
        
        // Target revenues for May 2026 (5 units)
        const unitTargets = {
            "Dạ Lan Center": 700000000,
            "Dạ Lan Star": 250000000,
            "Dạ Lan Event": 450000000,
            "Nhà máy Dạ Lan": 500000000,
            "Văn phòng": 0
        };
        
        const unitRevenues = {};
        const unitExpenses = {};
        this.DEPARTMENTS.forEach(dept => {
            unitRevenues[dept] = 0;
            unitExpenses[dept] = 0;
        });
        
        // Add dynamic labor cost per department to the unit expenses!
        const employees = this.getEmployees();
        employees.forEach(e => {
            if (unitExpenses[e.department] !== undefined) {
                unitExpenses[e.department] += (Number(e.salary) || 0);
            }
        });
        
        transactions.forEach(tx => {
            const amt = Number(tx.amount) || 0;
            if (tx.type === "income") {
                if (unitRevenues[tx.department] !== undefined) {
                    unitRevenues[tx.department] += amt;
                }
            } else if (tx.type === "expense") {
                if (unitExpenses[tx.department] !== undefined) {
                    unitExpenses[tx.department] += amt;
                }
            }
        });
        
        return {
            totalRevenue,
            foodCost,
            laborCost,
            opEx,
            totalExpenses,
            netProfit,
            primeCostPercent,
            laborCostPercent,
            foodCostPercent,
            unitTargets,
            unitRevenues,
            unitExpenses
        };
    },

    // --- Import / Export Backup ---
    exportData() {
        const backup = {
            employees: this.getEmployees(),
            transactions: this.getTransactions(),
            orders: this.getOrders()
        };
        const dataStr = JSON.stringify(backup, null, 2);
        return "data:text/json;charset=utf-8," + encodeURIComponent(dataStr);
    },

    exportBackupData() {
        return this.exportData();
    },

    importData(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed && parsed.employees && Array.isArray(parsed.employees)) {
                this.saveEmployees(parsed.employees);
                if (parsed.transactions && Array.isArray(parsed.transactions)) {
                    this.saveTransactions(parsed.transactions);
                }
                if (parsed.orders && Array.isArray(parsed.orders)) {
                    this.saveOrders(parsed.orders);
                }
                return { success: true, count: parsed.employees.length };
            } else if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
                // Fallback for legacy backups (employee-only array)
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
