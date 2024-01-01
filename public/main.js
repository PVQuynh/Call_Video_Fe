$('#div-chat').hide();

    // xử lý webrtc
$('#btnSignUp').click(() => {
        // Đăng ký
    const usename = $('#txtUserName').val();
    const id = $('#id').val();
    console.log("id: " + id + ", name: " + usename)

    const peer = new Peer(id);
    
    peer.on("open", () => {
        $('#div-dang-ky').hide();
        $('#div-chat').show();
        $('#my-peer').append(id);
        $('#my-name').append(usename);
    });
    peer.on("error", (err) => {
        console.error("Peer connection error: ", err);
    });

    // Caller
    $('#btnCall').click(() => {
        const id = $('#remoteId').val();
        
        openStream()
        .then(stream => {
            playStream('localStream', stream);
    
            const call = peer.call(id, stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    
            // Xử lý lỗi
            call.on('error', error => {
                console.error('Cuộc gọi bị lỗi:', error);
                
                // Đóng luồng và ngắt kết nối
                closeStream(stream);
            });
        })
        .catch(error => {
            console.error('Không thể mở luồng:', error);
        });
    })

    // Reciever
    peer.on('call', call => {
    openStream()
    .then(stream => {
        // Hiển thị giao diện xác nhận
        $('#callConfirmation').show();

        // Xử lý sự kiện khi người dùng chấp nhận cuộc gọi
        $('#btnAccept').click(() => {
            $('#callConfirmation').hide(); // Ẩn giao diện xác nhận

            call.answer(stream);
            playStream('localStream', stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream));

            // Xử lý lỗi
            call.on('error', error => {
                console.error('Cuộc gọi bị lỗi:', error);
            });
        });

        // Xử lý sự kiện khi người dùng từ chối cuộc gọi
        $('#btnReject').click(() => {
            $('#callConfirmation').hide(); // Ẩn giao diện xác nhận
            console.log('Người dùng từ chối cuộc gọi.');
        });
    })
    .catch(error => {
        console.error('Không thể mở luồng:', error);
    });
})
})



// xử lý luồng video
function openStream() {
    const cofig = {audio: false, video: true};
    return navigator.mediaDevices.getUserMedia(cofig);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);

    // Kiểm tra xem srcObject đã thay đổi
    try {
        if (video.srcObject !== stream) {
            video.srcObject = stream;
    
            // Chờ sự kiện loadedmetadata trước khi gọi play
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(error => {
                    console.error('Không thể chơi video:', error);
                });
            });
        } else {
            // Nếu srcObject không thay đổi, có thể gọi play trực tiếp
            video.play().catch(error => {
                console.error('Không thể chơi video:', error);
            });
        }
      } catch (error) {
        console.error('Không thể phát luồng:', error);
      }
}

$('#btnEndCall').click(() => {
    // Tắt video
    video.pause();
    video.srcObject = null;
});


// Hàm đóng luồng
function closeStream(stream) {
    if (stream) {
        // Ngắt kết nối
        stream.getTracks().forEach(track => track.stop());
        
        // Đóng luồng
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        
        // Ẩn video
        $('#localStream').get(0).srcObject = null;
    }
}