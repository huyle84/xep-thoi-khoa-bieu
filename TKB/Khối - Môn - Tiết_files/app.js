// Scroll menu
Scrollbar.initAll();

$(document).ready(function(){
	// Click icon menu
	$(document).on("click", ".icon-menu", function(){
		$("nav").toggleClass("actived");
	});

	// Tab
	function activeTab(obj)
	{
		$('ul.tab li').removeClass('active');
		$(obj).addClass('active');
		var id = $(obj).find('a').attr('href');
		$('.tab-item').hide();
		$(id).show();
	}
	$('.tab li').click(function(){
		activeTab(this);
		return false;
	});
	activeTab($('.tab li:first-child'));

	// Mobile layout tabs switcher
	function initMobileLayout() {
		if($('.layout-wrap').length > 0 && $('.mobile-layout-bar').length === 0) {
			var mobileBar = $('<div class="mobile-layout-bar">' +
				'<button type="button" class="btn-m-tab btn-m-list active" data-tab="list"><i class="fas fa-list-ul"></i> Danh sách</button>' +
				'<button type="button" class="btn-m-tab btn-m-detail" data-tab="detail"><i class="fas fa-file-alt"></i> Chi tiết</button>' +
			'</div>');
			$('.layout').prepend(mobileBar);

			if($('.layout-detail .sticky').length > 0 && $('.layout-detail .sticky .btn-back-to-list').length === 0) {
				var backBtn = $('<button type="button" class="btn-back-to-list"><i class="fas fa-arrow-left"></i> Danh sách</button>');
				$('.layout-detail .sticky').prepend(backBtn);
			}
		}
	}
	initMobileLayout();

	$(document).on('click', '.mobile-layout-bar .btn-m-tab', function(){
		var tab = $(this).attr('data-tab');
		$('.mobile-layout-bar .btn-m-tab').removeClass('active');
		$(this).addClass('active');
		if(tab === 'detail') {
			$('.layout-wrap').addClass('show-detail');
		} else {
			$('.layout-wrap').removeClass('show-detail');
		}
	});

	$(document).on('click', '.btn-back-to-list', function(e){
		e.preventDefault();
		$('.mobile-layout-bar .btn-m-tab').removeClass('active');
		$('.mobile-layout-bar .btn-m-list').addClass('active');
		$('.layout-wrap').removeClass('show-detail');
	});

	// Auto switch to detail tab on mobile when clicking an item, Add New or searching
	$(document).on('click', '.edit-row, input[name="addNew"], .edit-search', function(){
		if($(window).width() < 768) {
			var val = $(this).val();
			if(val !== '0') {
				$('.mobile-layout-bar .btn-m-tab').removeClass('active');
				$('.mobile-layout-bar .btn-m-detail').addClass('active');
				$('.layout-wrap').addClass('show-detail');
			}
		}
	});
});

// Choose date
$('body').on('focus',".ngay", function(){
	$(this).datepicker({
		changeMonth: true,
		changeYear: true,
		showOtherMonths: true,
		selectOtherMonths: true,
		dateFormat: 'dd-mm-yy',
		regional: 'vi-VN',
		yearRange: "1960:2030"
	});
});

$('.change-link').click(function(){
	$.ajax({
		method: 'POST',
		url: 'view/home/change-link.php',
		success:function(dulieu)
		{
			let info = JSON.parse(dulieu);
			if(info.status == 'fail')
			{
				Swal.fire({
					icon: 'error',
					text: info.mess
				});
			}
			else
			{
				Swal.fire({
					title: "Link public đổi",
					showDenyButton: false,
					showCancelButton: false,
					confirmButtonText: "Thành công"
				}).then((result) => {
					if (result.isConfirmed) 
					{
						location.reload();
					} 
					else if (result.isDenied) {
						location.reload();
					}
				});
			}
		}
	});
});

// Active page
let page = $("body").attr("p");
$('a[href="'+page+'"]').addClass("actived");