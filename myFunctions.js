$(document).ready(function () {

    // 1. إظهار البطاقات تدريجياً (تأثير بسيط باستخدام jQuery من المنهاج)[cite: 3]
    $(".card").hide().each(function (i) {
        $(this).fadeIn(600);
    });

    // 2. إظهار وإخفاء تفاصيل السيارة عبر jQuery (البند 1.3 في نص الوظيفة)[cite: 96]
    $('.toggle-details').off('change').on('change', function () {
        var detailsRow = $(this).closest('tr').next('.car-details');
        if ($(this).is(':checked')) {
            detailsRow.show();
        } else {
            detailsRow.hide();
        }
    });

    // 3. مراقبة تحديد أو إلغاء تحديد السيارات
    $('input[name="car"]').on('change', function () {
        var selectedCars = $('input[name="car"]:checked');
        if (selectedCars.length > 0) {
            $('#booking-form input, #booking-form select').removeClass('input-error');
        } else {
            $('#booking-form input, #booking-form select').addClass('input-error');
            alert('يرجى اختيار سيارة واحدة على الأقل للمتابعة!');
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

        // إظهار نموذج الحجز فوراً وانتقال سلس للشاشة
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

        // أ. التحقق من الاسم الكامل (أحرف هجائية عربية فقط - حسب متطلبات الوظيفة)[cite: 96]
        var arabicRegex = /^[\u0600-\u06FF\s]+$/;
        if (fullName !== "" && !arabicRegex.test(fullName)) {
            alert('خطأ: الاسم الكامل يجب أن يحتوي على أحرف هجائية عربية فقط!');
            $('#fullname').addClass('input-error').focus();
            $('#fullname').select();
            return;
        }

        // ب. التحقق من الرقم الوطني (11 خانة، وأول خانتين من 01 إلى 14 - إلزامي)[cite: 96, 97]
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

        // ج. التحقق من تواريخ البداية والنهاية والتسلسل الزمني (إلزامي)[cite: 96, 97]
        if (startDateStr === "" || endDateStr === "") {
            alert('خطأ: تاريخا بداية ونهاية التأجير إلزاميان!');
            return;
        }

        var startDate = new Date(startDateStr);
        var endDate = new Date(endDateStr);

        if (endDate <= startDate) {
            alert('خطأ: يجب أن يكون تاريخ نهاية التأجير لاحقاً لتاريخ البداية!');
            $('#end-date').addClass('input-error').focus();
            $('#end-date').select();
            return;
        }

        // د. التحقق من رقم الموبايل (يبدأ ببادئات سيريتل أو MTN المعتمدة)[cite: 96, 97]
        var phoneRegex = /^(093|094|095|096|098|099)\d{7}$/;
        if (phone !== "" && !phoneRegex.test(phone)) {
            alert('خطأ: رقم الموبايل غير صحيح! يجب أن يتكون من 10 أرقام ويبدأ ببادئة معتمدة لشبكتي سيريتل أو MTN.');
            $('#phone').addClass('input-error').focus();
            $('#phone').select();
            return;
        }

        // هـ. التحقق من البريد الإلكتروني (حسب معايير المنهاج البسيطة)[cite: 63]
        if (email !== "" && (email.length < 6 || email.indexOf('@') === -1 || email.indexOf('.') === -1)) {
            alert('خطأ: صيغة البريد الإلكتروني غير صحيحة!');
            $('#email').addClass('input-error').focus();
            $('#email').select();
            return;
        }

        // حساب عدد أيام التأجير والمبالغ والخصم (5% إذا زادت المدة عن 10 أيام - البند 1.4)[cite: 97]
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

        // رسالة النجاح النهائية المطابقة لمتطلبات سلم التصحيح[cite: 97]
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