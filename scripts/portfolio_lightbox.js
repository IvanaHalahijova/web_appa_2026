// Portfolio Lightbox Gallery
const projectImages = {
    "CH HORARSKA": ["CH HORARSKA_0", "CH HORARSKA_1", "CH HORARSKA_2", "CH HORARSKA_3", "CH HORARSKA_4", "CH HORARSKA_5", "CH HORARSKA_6", "CH HORARSKA_7", "CH HORARSKA_8"],
    "RD HACIK": ["RD HACIK_1", "RD HACIK_2", "RD HACIK_3", "RD HACIK_4", "RD HACIK_5", "RD HACIK_6", "RD HACIK_7", "RD HACIK_8"],
    "RD JHSCKHNT": ["RD JHSCKHNT_1", "RD JHSCKHNT_2", "RD JHSCKHNT_3", "RD JHSCKHNT_4", "RD JHSCKHNT_5", "RD JHSCKHNT_8"],
    "RD MAKOSKNT": ["RD MAKOSKNT_1", "RD MAKOSKNT_10", "RD MAKOSKNT_2", "RD MAKOSKNT_3", "RD MAKOSKNT_4", "RD MAKOSKNT_5", "RD MAKOSKNT_6", "RD MAKOSKNT_7", "RD MAKOSKNT_8", "RD MAKOSKNT_9"],
    "RD MDZNY": ["RD MDZNY_1", "RD MDZNY_2"],
    "RD MIKLUSSLGVK": ["RD MIKLUSSLGVK_1", "RD MIKLUSSLGVK_10", "RD MIKLUSSLGVK_2", "RD MIKLUSSLGVK_3", "RD MIKLUSSLGVK_4", "RD MIKLUSSLGVK_5", "RD MIKLUSSLGVK_6", "RD MIKLUSSLGVK_7", "RD MIKLUSSLGVK_8", "RD MIKLUSSLGVK_9"],
    "RD POLIACEK": ["RD POLIACEK_1", "RD POLIACEK_10", "RD POLIACEK_2", "RD POLIACEK_3", "RD POLIACEK_5", "RD POLIACEK_6", "RD POLIACEK_8", "RD POLIACEK_9"],
    "RD TIVADAR": ["RD TIVADAR_0", "RD TIVADAR_1", "RD TIVADAR_2", "RD TIVADAR_3", "RD TIVADAR_5", "RD TIVADAR_6", "RD TIVADAR_7"],
    "DD ASTROVÁ": ["DD ASTROVÁ_1", "DD ASTROVÁ_10", "DD ASTROVÁ_11", "DD ASTROVÁ_2", "DD ASTROVÁ_4", "DD ASTROVÁ_6", "DD ASTROVÁ_8"],
    "INT BARBERJC": ["INT BARBERJC_03", "INT BARBERJC_04", "INT BARBERJC_05", "INT BARBERJC_06", "INT BARBERJC_07", "INT BARBERJC_08", "INT BARBERJC_09", "INT BARBERJC_1", "INT BARBERJC_10", "INT BARBERJC_11", "INT BARBERJC_12", "INT BARBERJC_13", "INT BARBERJC_14", "INT BARBERJC_15", "INT BARBERJC_16", "INT BARBERJC_17", "INT BARBERJC_18", "INT BARBERJC_19", "INT BARBERJC_2"],
    "INT KOCISKO": ["INT KOCISKO_01", "INT KOCISKO_02", "INT KOCISKO_10", "INT KOCISKO_3", "INT KOCISKO_4", "INT KOCISKO_5", "INT KOCISKO_6", "INT KOCISKO_7", "INT KOCISKO_8", "INT KOCISKO_9"],
    "INT ZICH": ["INT ZICH_0", "INT ZICH_1", "INT ZICH_10", "INT ZICH_11", "INT ZICH_12", "INT ZICH_13", "INT ZICH_14", "INT ZICH_15", "INT ZICH_16", "INT ZICH_17", "INT ZICH_18", "INT ZICH_19", "INT ZICH_2", "INT ZICH_20", "INT ZICH_21", "INT ZICH_22", "INT ZICH_23", "INT ZICH_24", "INT ZICH_25", "INT ZICH_26", "INT ZICH_27", "INT ZICH_28", "INT ZICH_29", "INT ZICH_3", "INT ZICH_30", "INT ZICH_31", "INT ZICH_32", "INT ZICH_33", "INT ZICH_4", "INT ZICH_5", "INT ZICH_6", "INT ZICH_7", "INT ZICH_8", "INT ZICH_9"],
    "IBV FNTCKNVLK": ["IBV FNTCKNVLK_1", "IBV FNTCKNVLK_10", "IBV FNTCKNVLK_2", "IBV FNTCKNVLK_3", "IBV FNTCKNVLK_4", "IBV FNTCKNVLK_5", "IBV FNTCKNVLK_7", "IBV FNTCKNVLK_8"],
    "IBV FNTCNRCS": ["IBV FNTCNRCS_0", "IBV FNTCNRCS_1"],
    "OB FOREST": ["OB FOREST_1", "OB FOREST_2", "OB FOREST_3", "OB FOREST_5", "OB FOREST_6"]
};

let currentProject = null;
let currentImageIndex = 0;
let currentImages = [];

const modal = new bootstrap.Modal(document.getElementById('portfolioModal'));
const lightboxImage = document.getElementById('lightboxImage');
const imageCounter = document.getElementById('imageCounter');
const modalTitle = document.getElementById('portfolioModalLabel');

// Open lightbox when clicking on project card
document.querySelectorAll('.portfolio-project-card').forEach(card => {
    card.addEventListener('click', function() {
        const projectName = this.getAttribute('data-project');
        openLightbox(projectName);
    });
});

function openLightbox(projectName) {
    currentProject = projectName;
    currentImages = projectImages[projectName] || [];
    currentImageIndex = 0;
    
    if (currentImages.length > 0) {
        modalTitle.textContent = projectName.replace(/_/g, ' ');
        showImage(currentImageIndex);
        modal.show();
    }
}

function showImage(index) {
    if (index < 0) index = currentImages.length - 1;
    if (index >= currentImages.length) index = 0;
    
    currentImageIndex = index;
    const imageName = currentImages[index];
    lightboxImage.src = `img/optimized/portfolio/${encodeURIComponent(imageName)}-1800.jpg`;
    imageCounter.textContent = `${index + 1} / ${currentImages.length}`;
}

// Navigation buttons
document.getElementById('prevImage').addEventListener('click', () => {
    showImage(currentImageIndex - 1);
});

document.getElementById('nextImage').addEventListener('click', () => {
    showImage(currentImageIndex + 1);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const modalElement = document.getElementById('portfolioModal');
    if (modalElement.classList.contains('show')) {
        if (e.key === 'ArrowLeft') showImage(currentImageIndex - 1);
        if (e.key === 'ArrowRight') showImage(currentImageIndex + 1);
        if (e.key === 'Escape') modal.hide();
    }
});
