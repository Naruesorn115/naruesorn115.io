const PROFILE_PHOTO_KEY = "naruesorn-portfolio-profile-photo";

document.querySelectorAll(".profile-img").forEach((image) => {
    const controls = document.createElement("div");
    controls.className = "profile-controls";

    const picker = document.createElement("button");
    picker.className = "profile-picker";
    picker.type = "button";
    picker.textContent = "เลือกรูปโปรไฟล์";

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.hidden = true;
    input.setAttribute("aria-label", "เลือกรูปโปรไฟล์จากอุปกรณ์");

    const status = document.createElement("p");
    status.className = "profile-status";
    status.setAttribute("aria-live", "polite");
    status.textContent = "เลือกรูปจากอุปกรณ์ของคุณได้";

    const preview = document.createElement("dialog");
    preview.className = "profile-preview";
    preview.setAttribute("aria-label", "รูปโปรไฟล์ขนาดใหญ่");

    const closePreview = document.createElement("button");
    closePreview.className = "profile-preview-close";
    closePreview.type = "button";
    closePreview.textContent = "ปิด";
    closePreview.setAttribute("aria-label", "ปิดรูปโปรไฟล์");

    const previewImage = document.createElement("img");
    previewImage.alt = "รูปโปรไฟล์ขนาดใหญ่";
    preview.append(closePreview, previewImage);

    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", "กดเพื่อดูรูปโปรไฟล์ขนาดใหญ่");

    const openPreview = () => {
        previewImage.src = image.src;
        preview.showModal();
        closePreview.focus();
    };

    image.addEventListener("click", openPreview);
    image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPreview();
        }
    });
    closePreview.addEventListener("click", () => preview.close());
    preview.addEventListener("cancel", () => preview.close());
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && preview.open) preview.close();
    });
    preview.addEventListener("click", (event) => {
        if (event.target === preview) preview.close();
    });
    preview.addEventListener("close", () => image.focus());

    const fallbackPhoto = `data:image/svg+xml,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#c4b5fd"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect width="160" height="160" fill="url(#g)"/><circle cx="80" cy="61" r="29" fill="#fff" fill-opacity=".92"/><path d="M25 160c3-34 25-53 55-53s52 19 55 53" fill="#fff" fill-opacity=".92"/></svg>'
    )}`;
    const showFallback = () => {
        image.removeEventListener("error", showFallback);
        image.src = fallbackPhoto;
    };
    image.addEventListener("error", showFallback);

    picker.addEventListener("click", () => input.click());
    input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            status.textContent = "กรุณาเลือกไฟล์รูปภาพ";
            input.value = "";
            return;
        }

        status.textContent = "กำลังโหลดรูปภาพ...";

        try {
            const bitmap = await createImageBitmap(file);
            const canvas = document.createElement("canvas");
            const scale = Math.min(1, 600 / Math.max(bitmap.width, bitmap.height));
            canvas.width = Math.round(bitmap.width * scale);
            canvas.height = Math.round(bitmap.height * scale);
            canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            bitmap.close();

            const photo = canvas.toDataURL("image/jpeg", 0.82);
            try {
                localStorage.setItem(PROFILE_PHOTO_KEY, photo);
            } catch (error) {
                status.textContent = "บันทึกรูปไม่สำเร็จ พื้นที่จัดเก็บของเบราว์เซอร์อาจเต็ม";
                console.error("Unable to save the profile photo.", error);
                return;
            }

            document.querySelectorAll(".profile-img").forEach((profileImage) => {
                profileImage.src = photo;
            });
            status.textContent = "เปลี่ยนรูปโปรไฟล์แล้ว";
        } catch (error) {
            status.textContent = "เปิดรูปนี้ไม่ได้ กรุณาลองเลือกไฟล์รูปภาพอื่น";
            console.error("Unable to load the selected profile photo.", error);
        } finally {
            input.value = "";
        }
    });

    controls.append(picker, input, status);
    image.insertAdjacentElement("afterend", controls);
    controls.insertAdjacentElement("afterend", preview);

    try {
        const savedPhoto = localStorage.getItem(PROFILE_PHOTO_KEY);
        if (savedPhoto) image.src = savedPhoto;
        else if (image.complete && image.naturalWidth === 0) showFallback();
    } catch (error) {
        status.textContent = "เบราว์เซอร์ไม่อนุญาตให้จำรูปโปรไฟล์";
        console.error("Unable to read the saved profile photo.", error);
    }
});

const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".navbar a").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
        link.setAttribute("aria-current", "page");
    }
});
