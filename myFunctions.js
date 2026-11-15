$(document).ready(function () {

    // 1. إظهار بطاقات السيارات تدريجياً عند تحميل الصفحة
    $(".card").hide().each(function (i) {
        $(this).fadeIn(600);
    });

    // 2. إظهار وإخفاء تفاصيل السيارة عبر jQuery
    $('.toggle-details').off('change').on('change', function () {
        var detailsRow = $(this).closest('tr').next('.car-details');
        if ($(this).is(':checked')) {
            detailsRow.show();
        } else {
            detailsRow.hide();
        }
    });

    // 3. مراقبة تحديد السيارات: عند اختيار أي سيارة نزيل تلوين الخطأ عن الحقول
    $('input[name="car"]').on('change', function () {
        var selectedCars = $('input[name="car"]:checked');
        if (selectedCars.length > 0) {
            $('#booking-form input, #booking-form select').removeClass('input-error');
        }
    });

    // 4. زر "متابعة": مخصص فقط لإظهار نموذج الحجز بعد التأكد من اختيار سيارة
    $('#btn-continue').on('click', function () {
        var selectedCars = $('input[name="car"]:checked');

        if (selectedCars.length === 0) {
            $('#booking-form input, #booking-form select').addClass('input-error');
            alert('يرجى اختيار سيارة واحدة على الأقل للمتابعة!');
            return;
        }

        // إظهار نموذج الحجز والانتقال إليه بسلاسة
        $('#booking-form-container').fadeIn();
        $('html, body').animate({
            scrollTop: $("#booking-form-container").offset().top
        }, 500);
    });

    // 5. التحقق عند إرسال النموذج (Submit)
    $('#booking-form').on('submit', function (e) {
        e.preventDefault();

        var selectedCars = $('input[name="car"]:checked');

        // **التحقق الأساسي هنا:** إذا لم يتم اختيار أي سيارة، نلون الحقول وننبهه ونمنع المتابعة
        if (selectedCars.length === 0) {
            $('#booking-form input, #booking-form select').addClass('input-error');
            alert('يرجى اختيار سيارة واحدة على الأقل للمتابعة!');
            return;
        }

        $('#booking-form input, #booking-form select').removeClass('input-error');

        // جلب قيم الحقول
        var fullName = $('#fullname').val().trim();
        var nationalId = $('#national-id').val().trim();
        var startDateStr = $('#start-date').val();
        var endDateStr = $('#end-date').val();
        var phone = $('#phone').val().trim();
        var email = $('#email').val().trim();

        // أ. التحقق من الاسم الكامل (أحرف هجائية عربية فقط )
        var arabicRegex = /^[\u0621-\u064A\s]+$/;
        if (fullName !== "" && !arabicRegex.test(fullName)) {
            alert('خطأ: الاسم الكامل يجب أن يحتوي على أحرف هجائية عربية فقط!');
            $('#fullname').addClass('input-error').focus();
            $('#fullname').select();
            return;
        }

        // ب. التحقق من الرقم الوطني (11 خانة، وأول خانتين من 01 إلى 14 - إلزامي)
        var nationalIdRegex = /^(0[1-9]|1[0-4])\d{9}$/;
        if (nationalId === "") {
            alert('خطأ: حقل الرقم الوطني إلزامي!');
            $('#national-id').addClass('input-error').focus();
            return;
        } else if (!nationalIdRegex.test(nationalId)) {
            alert('خطأ: الرقم الوطني يجب أن يكون 11 رقماً، وتبدأ أول خانتين برمز محافظة صحيح (من 01 إلى 14)!');
            $('#national-id').addClass('input-error').focus();
            $('#national-id').select();
            return;
        }

        // ج. التحقق من تواريخ البداية والنهاية بصيغة yyyy-mm-dd والتسلسل الزمني (إلزامي)
        if (startDateStr === "" || endDateStr === "") {
            alert('خطأ: تاريخا بداية ونهاية التأجير إلزاميان!');
            return;
        }

        // فحص صحة التاريخ قبل استخدامه لحساب عدد الأيام
        function parseYMD(dateText) {
            var dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
            var parts = dateRegex.exec(dateText);
            if (parts === null) {
                return null;
            }
            var year = parseInt(parts[1], 10);
            var month = parseInt(parts[2], 10);
            var day = parseInt(parts[3], 10);
            var dateObj = new Date(year, month - 1, day);
            if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
                return null;
            }
            return dateObj;
        }

        var startDate = parseYMD(startDateStr);
        var endDate = parseYMD(endDateStr);

        if (startDate === null) {
            alert('خطأ: تاريخ البداية يجب أن يكتب بصيغة yyyy-mm-dd (مثال: 2026-11-20)!');
            $('#start-date').addClass('input-error').focus();
            $('#start-date').select();
            return;
        }

        if (endDate === null) {
            alert('خطأ: تاريخ النهاية يجب أن يكتب بصيغة yyyy-mm-dd (مثال: 2026-12-05)!');
            $('#end-date').addClass('input-error').focus();
            $('#end-date').select();
            return;
        }

        if (endDate <= startDate) {
            alert('خطأ: يجب أن يكون تاريخ نهاية التأجير لاحقاً لتاريخ البداية!');
            $('#end-date').addClass('input-error').focus();
            $('#end-date').select();
            return;
        }

        // د. التحقق من رقم الموبايل (يبدأ ببادئات سيريتل أو MTN المعتمدة)
        var phoneRegex = /^(093|094|095|096|098|099)\d{7}$/;
        if (phone !== "" && !phoneRegex.test(phone)) {
            alert('خطأ: رقم الموبايل غير صحيح! يجب أن يتكون من 10 أرقام ويبدأ ببادئة معتمدة لشبكتي سيريتل أو MTN.');
            $('#phone').addClass('input-error').focus();
            $('#phone').select();
            return;
        }

        // هـ. التحقق من البريد الإلكتروني
        var emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
        if (email !== "" && !emailRegex.test(email)) {
        alert('خطأ: صيغة البريد الإلكتروني غير صحيحة!');
        $('#email').addClass('input-error').focus();
        $('#email').select();
        return;
        }

        // حساب عدد أيام التأجير والمبالغ والخصم (5% إذا زادت المدة عن 10 أيام)
        var timeDiff = endDate.getTime() - startDate.getTime();
        var daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24));

        var selectedCarsList = [];
        var grandTotalBeforeDiscount = 0;

        selectedCars.each(function () {
            var row = $(this).closest('tr');
            var carCode = row.find('td:eq(0)').text().trim();
            var carModel = row.find('td:eq(1)').text().trim();
            var dailyPriceText = row.find('td:eq(3)').text().trim();
            
            var dailyPrice = parseInt(dailyPriceText.replace(/[^\d]/g, ''), 10) || 0;
            var totalCarCost = dailyPrice * daysCount;
            
            grandTotalBeforeDiscount += totalCarCost;

            selectedCarsList.push({
                code: carCode,
                model: carModel,
                days: daysCount,
                price: dailyPrice,
                totalCost: totalCarCost
            });
        });

        var discountPercent = (daysCount > 10) ? 5 : 0;
        var discountAmount = (grandTotalBeforeDiscount * discountPercent) / 100;
        var finalTotal = grandTotalBeforeDiscount - discountAmount;

        // رسالة النجاح النهائية 
        var message = "=== تم حجز السيارات بنجاح! ===\n\n";
        message += "السيارات المختارة:\n";
        
        selectedCarsList.forEach(function (car) {
            message += "- " + car.model + " (" + car.code + "): " + car.days + " يوم, السعر اليومي: " + car.price.toLocaleString() + " ل.س (الإجمالي: " + car.totalCost.toLocaleString() + " ل.س)\n";
        });

        message += "\nالمبلغ الإجمالي قبل الخصم: " + grandTotalBeforeDiscount.toLocaleString() + " ل.س\n";
        
        if (discountPercent > 0) {
            message += "نسبة الخصم (لتجاوز المدة 10 أيام): " + discountPercent + "%\n";
            message += "قيمة الخصم: " + discountAmount.toLocaleString() + " ل.س\n";
        } else {
            message += "الخصم: 0% (الخصم 5% يطبق فقط إذا زادت المدة عن 10 أيام)\n";
        }

        message += "المبلغ الإجمالي النهائي: " + finalTotal.toLocaleString() + " ل.س";

        alert(message);
    });

});