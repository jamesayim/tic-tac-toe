document.addEventListener("DOMContentLoaded", function() {

    const navigateButton = document.getElementById("start-game-btn");
    
    if (navigateButton) {
        navigateButton.addEventListener("click", function(e) {
            e.preventDefault();
            document.body.classList.add("fade-out");
        
            setTimeout(() => {
                window.location.href = "gameboard.html";
            }, 500);
        });
    }
});

localStorage.setItem("playerMark", "x");
document.getElementById("option-o").addEventListener("click", () => {
    localStorage.setItem("playerMark", "o");
});
document.getElementById("option-x").addEventListener("click", () => {
    localStorage.setItem("playerMark", "x");
});
