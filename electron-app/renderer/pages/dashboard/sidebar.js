// Sidebar collapse/expand functionality for left-sidebar, no inline scripts required.
document.addEventListener('DOMContentLoaded', function() {
    // Ensure only one menu section is open at a time (accordion behavior).
    var menuParents = document.querySelectorAll('.sidebar-nav .has-children > a');
    menuParents.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var parentLi = link.parentElement;
            var submenu = parentLi.querySelector('.child-nav');
            var arrow = link.querySelector('.arrow');

            // Collapse all other open menus
            document.querySelectorAll('.sidebar-nav .has-children').forEach(function(otherLi) {
                var otherSubmenu = otherLi.querySelector('.child-nav');
                var otherArrow = otherLi.querySelector('.arrow');
                if(otherLi !== parentLi) {
                    if(otherSubmenu && otherSubmenu.style.display !== 'none') {
                        otherSubmenu.style.display = 'none';
                        if(otherArrow) otherArrow.classList.remove('rotate');
                    }
                }
            });

            // Toggle this submenu
            if(submenu) {
                if(submenu.style.display === 'none' || submenu.style.display === '') {
                    submenu.style.display = 'block';
                    if(arrow) arrow.classList.add('rotate');
                } else {
                    submenu.style.display = 'none';
                    if(arrow) arrow.classList.remove('rotate');
                }
            }
        });
    });

    // Optionally: Open the first menu by default
    // var firstMenu = document.querySelector('.sidebar-nav .has-children .child-nav');
    // if (firstMenu) firstMenu.style.display = 'block';
});