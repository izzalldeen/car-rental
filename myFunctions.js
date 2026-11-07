$(document).ready(function () {

    $(".card").hide().each(function (i) {
        $(this).delay(200 * i).fadeIn(600);
    });

    $(".data-table tbody tr").hover(
        function () { $(this).stop().animate({ opacity: 0.85 }, 150); },
        function () { $(this).stop().animate({ opacity: 1 }, 150); }
    );

    
    $('.toggle-details').on('change', function () {
        var detailsRow = $(this).closest('tr').next('.car-details');
        if ($(this).is(':checked')) {
            detailsRow.show();
        } else {
            detailsRow.hide();
        }
    });

    $('#btn-continue').on('click', function () {
        var selectedCars = $('input[name="car"]:checked');

        if (selectedCars.length === 0) {
            alert('يرجى اختيار سيارة واحدة على الأقل للمتابعة!');
            $('#booking-form-container').hide();
            return;
        }

        $('#booking-form-container').fadeIn();
        $('html, body').animate({
            scrollTop: $("#booking-form-container").offset().top
        }, 500);
    });

    $('#booking-form').on('submit', function (e) {
        e.preventDefault(); // منع إعادة تحميل الصفحة

        var fullName = $('#fullname').val().trim();
        var nationalId = $('#national-id').val().trim();
        var startDateStr = $('#start-date').val();
        var endDateStr = $('#end-date').val();
        var phone = $('#phone').val().trim();
        var email = $('#email').val().trim();

       
        var arabicRegex = /^[\u0600-\u06FF\s]+$/;
        if (fullName !== "" && !arabicRegex.test(fullName)) {
            alert('خطأ: الاسم الكامل يجب أن يحتوي على أحرف هجائية عربية فقط!');
            return;
        }

        
        var nationalIdRegex = /^(0[1-9]|1[0-4])\d{9}$/;
        if (nationalId === "") {
            alert('خطأ: حقل الرقم الوطني إلزامي!');
            return;
        } else if (!nationalIdRegex.test(nationalId)) {
            alert('خطأ: الرقم الوطني يجب أن يكون مكوناً من 11 رقماً وأول خانتين ترمزان للمحافظة (من 01 إلى 14)!');
            return;
        }

        // 3. التحقق من تواريخ البداية والنهاية
        if (startDateStr === "" || endDateStr === "") {
            alert('خطأ: تواريخ بداية ونهاية التأجير إلزامية!');
            return;
        }

        var startDate = new Date(startDateStr);
        var endDate = new Date(endDateStr);

        if (endDate <= startDate) {
            alert('خطأ: يجب أن يكون تاريخ نهاية التأجير لاحقاً لتاريخ البداية!');
            return;
        }

        
        var phoneRegex = /^(093|094|095|096|098|099)\d{7}$/;
        if (phone !== "" && !phoneRegex.test(phone)) {
            alert('خطأ: رقم الموبايل غير صحيح! يجب أن يتكون من 10 أرقام ويبدأ ببادئة معتمدة لشبكتي سيريتل أو MTN.');
            return;
        }

       
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email !== "" && !emailRegex.test(email)) {
            alert('خطأ: صيغة البريد الإلكتروني غير صحيحة!');
            return;
        }

        
        var timeDiff = endDate.getTime() - startDate.getTime();
        var daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24));

        var selectedCarsList = [];
        var grandTotalBeforeDiscount = 0;

        
        $('input[name="car"]:checked').each(function () {
            var row = $(this).closest('tr');
            var carCode = row.find('td:eq(0)').text().trim();
            var carModel = row.find('td:eq(1)').text().trim();
            var dailyPriceText = row.find('td:eq(3)').text().trim();
            
            var dailyPrice = parseInt(dailyPriceText.replace(/[^\d]/g, ''), 10);
            var totalCarCost = dailyPrice * daysCount;
            
            grandTotalBeforeDiscount += totalCarCost;

            selectedCarsList.push({
                code: carCode,
                model: carModel,
                price: dailyPrice,
                totalCost: totalCarCost
            });
        });

        
        var discountPercent = (daysCount > 10) ? 5 : 0;
        var discountAmount = (grandTotalBeforeDiscount * discountPercent) / 100;
        var finalTotal = grandTotalBeforeDiscount - discountAmount;

       
        var message = "=== تم حجز السيارات بنجاح! ===\n\n";
        message += "السيارات المختارة:\n";
        
        selectedCarsList.forEach(function (car) {
            message += "- " + car.model + " (" + car.code + "): " + car.price.toLocaleString() + " ل.س / يومياً\n";
        });

        message += "\nعدد أيام التأجير لكل سيارة: " + daysCount + " يوم/أيام\n";
        message += "المبلغ الإجمالي قبل الخصم: " + grandTotalBeforeDiscount.toLocaleString() + " ل.س\n";

        if (discountPercent > 0) {
            message += "نسبة الخصم (لتجاوز المدة 10 أيام): " + discountPercent + "%\n";
            message += "قيمة الخصم: " + discountAmount.toLocaleString() + " ل.س\n";
        } else {
            message += "الخصم: 0% (الخصم 5% يطبق فقط إذا زادت المدة عن 10 أيام)\n";
        }

        message += "\nالمبلغ الإجمالي النهائي: " + finalTotal.toLocaleString() + " ل.س";

        alert(message);
    });

});