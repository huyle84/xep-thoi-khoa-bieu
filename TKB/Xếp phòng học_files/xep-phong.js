$('.reset-phong').click(function(){
	Swal.fire({
		icon: 'warning',
		text: 'Bạn có chắc chắn muốn reset toàn bộ xếp phòng?',
		showCancelButton: true,
		confirmButtonText: 'Đồng ý',
		cancelButtonText: 'Hủy'
	}).then(function(result){
		if (result.isConfirmed) {
			$('.loading').css('display', 'flex');
			$.ajax({
				method: 'POST',
				url: 'view/xep-phong/reset.php',
				success:function(dulieu)
				{
					try {
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
							localStorage.removeItem('xepphong');
							window.location.reload();
						}
					} catch(e) {
						window.location.reload();
					}
					$('.loading').css('display', 'none');
				},
				error: function() {
					$('.loading').css('display', 'none');
				}
			});
		}
	});
});

$('.sua-phong').click(function(){
	$(this).toggleClass('change');
	let edit = parseInt($(this).attr('edit'));
	if(edit == 0)
	{
		$(this).attr('edit', 1);
		$(this).html('Hủy xóa');
		$('.buoi-choose').css('cursor', 'crosshair');
	}
	else
	{
		$(this).attr('edit', 0);
		$(this).html('Sửa');
		$('.buoi-choose').css('cursor', 'pointer');
	}
});

$('.item-phong').click(function(){
	let phong = parseInt($(this).attr('phong'));
	if(phong > 0)
	{
		$('.item-phong').removeClass('chon-phong');
		$(this).addClass('chon-phong');
		localStorage.xepphong = phong;

		// Đổi màu highlight cho các ô lớp đã xếp phòng này
		$('.buoi-choose').css('background-color', '#fff');
		$('.buoi-choose[p="'+phong+'"]').css('background-color', 'yellow');
	}
});

// Chọn phòng theo localStorage khi tải trang
if(localStorage.xepphong)
{
	let savedPhong = parseInt(localStorage.xepphong);
	if (savedPhong > 0 && $('.item-phong-'+savedPhong).length) {
		$('.item-phong-'+savedPhong).addClass('chon-phong');
		$('.buoi-choose[p="'+savedPhong+'"]').css('background-color', 'yellow');
	} else {
		localStorage.removeItem('xepphong');
	}
}

// Chọn lớp xếp phòng
$(document).on('click', '.buoi-choose', function(){
	let l = $(this).attr('l');
	let b = $(this).attr('b');
	let p = parseInt(localStorage.xepphong || 0);
	let status = parseInt($('.sua-phong').attr('edit'));

	if(status == 0)
	{
		if(p > 0)
		{
			$('.loading').css('display', 'flex');
			$.ajax({
				method: 'POST',
				data: {l:l, b:b, p:p},
				url: 'view/xep-phong/edit.php',
				success:function(dulieu)
				{
					try {
						let info = JSON.parse(dulieu);
						if(info.status == 'fail')
						{
							Swal.fire({
								icon: 'error',
								text: info.mess
							});
						}
						else if(info.status == 'trung')
						{
							Swal.fire({
								icon: 'error',
								html: info.mess
							});
						}
						else if(info.status == 'success')
						{
							$(`.l-b-${l}-${b}`).html(info.tenphong);
							$(`.l-b-${l}-${b}`).attr('p', p);
							
							$('.buoi-choose').css('background-color', '#fff');
							$('.buoi-choose[p="'+p+'"]').css('background-color', 'yellow');
						}
					} catch(e) {
						console.error("Parse error:", e);
					}
					$('.loading').css('display', 'none');
				},
				error: function() {
					$('.loading').css('display', 'none');
				}
			});
		}
		else
		{
			Swal.fire({
				icon: 'error',
				text: 'Vui lòng chọn phòng học ở thanh trên trước'
			});
		}
	}
	else
	{
		// Thực hiện xóa phòng
		$('.loading').css('display', 'flex');
		$.ajax({
			method: 'POST',
			data: {l:l, b:b},
			url: 'view/xep-phong/del.php',
			success:function(dulieu)
			{
				try {
					let info = JSON.parse(dulieu);
					if(info.status == 'fail')
					{
						Swal.fire({
							icon: 'error',
							text: info.mess
						});
					}
					else if(info.status == 'success')
					{
						$(`.l-b-${l}-${b}`).html('');
						$(`.l-b-${l}-${b}`).attr('p', 0);
						$(`.l-b-${l}-${b}`).css('background-color', '#fff');
					}
				} catch(e) {
					console.error("Parse error:", e);
				}
				$('.loading').css('display', 'none');
			},
			error: function() {
				$('.loading').css('display', 'none');
			}
		});
	}
});
