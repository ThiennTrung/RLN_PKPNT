    function filterTable() {
        const input = document.getElementById("searchInput");
        const filter = input.value.toUpperCase();
        const activeContent = document.querySelector('.content.active');
        const table = activeContent.querySelector("table");
        const tr = table.getElementsByTagName("tr");
        let visibleCount = 0;

        for (let i = 1; i < tr.length; i++) {
            let found = false;
            const td = tr[i].getElementsByTagName("td");
            for (let j = 0; j < td.length; j++) {
                if (td[j]) {
                    const txtValue = td[j].textContent || td[j].innerText;
                    if (txtValue.toUpperCase().indexOf(filter) > -1) {
                        found = true;
                        break;
                    }
                }
            }
            if (found) { tr[i].style.display = ""; visibleCount++; }
            else { tr[i].style.display = "none"; }
        }
        document.getElementById("noResult").style.display = (visibleCount === 0 && filter !== "") ? "block" : "none";
    }

    const jsonUrl = 'data.json';
    let globalData = null;
    let currentEnv = 'UAT'; 

    // 1. Hàm load dữ liệu ban đầu
    async function loadData() {
        try {
            const response = await fetch('data.json');
            globalData = await response.json();
            
            // Mặc định ban đầu hiển thị tab UAT
            updateVersionCombobox('UAT');
        } catch (e) {
            console.error("Lỗi load file JSON", e);
        }
    }
    // 2. Show data
    function showTab(evt, tabId) {
        const contents = document.querySelectorAll('.content');
        contents.forEach(c => c.classList.remove('active'));
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(b => b.classList.remove('active'));

        document.getElementById(tabId).classList.add('active');
        evt.currentTarget.classList.add('active');
        
        // Cập nhật Version và Ngày cập nhật lên Header
        // document.getElementById('display-version').innerText = releaseData[tabId].version;
        // document.getElementById('display-date').innerText = releaseData[tabId].date;

        document.getElementById('searchInput').value = '';
        filterTable(); 

        // Xác định môi trường dựa trên contentId
        const env = tabId.includes('uat-content') ? 'UAT' : 'PRO';
        updateVersionCombobox(env);
    }
    // 3. Hàm cập nhật danh sách Version vào Combobox theo môi trường
    function updateVersionCombobox(env) {
        const select = document.getElementById('versionSelect');
        const versions = globalData[env];

        if (!versions || versions.length === 0) {
            select.innerHTML = '<option>Không có version</option>';
            return;
        }

        // 1. Đổ danh sách Version vào select
        select.innerHTML = versions.map((v, index) => 
            `<option value="${index}" data-env="${env}">${v.VERSION}</option>`
        ).join('');

        // 2. CHỈNH SỬA TẠI ĐÂY: Chọn index cuối cùng của mảng
        const lastIndex = versions.length - 1;
        select.value = lastIndex; 

        // 3. Sau khi cập nhật danh sách và set giá trị cuối, load bảng
        handleVersionChange();
    }

    // 4. Hàm xử lý khi chọn Version từ Combobox
   function handleVersionChange() 
   {
        const select = document.getElementById('versionSelect');
        const selectedIndex = select.value;
        
        const selectedOption = select.options[select.selectedIndex];
        if (!selectedOption) return; // Tránh lỗi nếu combo trống

        const env = selectedOption.getAttribute('data-env');
        const tbodyId = (env === 'UAT') ? 'tableUATBody' : 'tablePROBody';
        
        // Nếu có data thì lấy CONTENTS, nếu không thì truyền mảng rỗng []
        const data = globalData[env][selectedIndex];
        const contents = (data && data.CONTENTS) ? data.CONTENTS : [];
        renderTable(contents, tbodyId);
        
        // 2. Cập nhật Update Time lên UI
        const timeDisplay = document.getElementById('updateTimeDisplay');
        if (data && data.UPDATETIME) {
            timeDisplay.innerHTML = `Ngày cập nhật: ${data.UPDATETIME}`;
        } else {
            timeDisplay.innerHTML = ""; // Hoặc để "Chưa có thông tin thời gian"
        }

        
    }   
    // 5. Hàm vẽ bảng
    function renderTable(contents, tbodyId)
    {
        const tbody = document.getElementById(tbodyId);
        
        // Nếu có dữ liệu, tiến hành render như bình thường
        tbody.innerHTML = contents.map((item,index )=> `
            <tr>
                <td>${index + 1}</td>
                <td>${item.NOIDUNG}</td>
                <td>
                    <a href="https://jira.fis.com.vn/browse/${item.JIRA_TICKET}" target="_blank" class="jira-link">
                        ${item.JIRA_TICKET}
                    </a>
                </td>
                <td>${item.GHICHU || ''}</td>
            </tr>
        `).join('');
    }
document.addEventListener('DOMContentLoaded', loadData);