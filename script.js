const selectElement = document.getElementById('fruits');

selectElement.addEventListener('change', (event) => {
    console.log("Bạn đã chọn: " + event.target.value);
});