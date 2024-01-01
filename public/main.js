let peer;
let localStream;

$('#div-chat').hide();

// Hàm mở luồng video
function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

// Hàm chơi luồng video
function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);

    try {
        if (video.srcObject !== stream) {
            video.srcObject = stream;

            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
        } else {
            video.play().catch(error => {
                console.error('Không thể chơi video:', error);
            });
        }
    } catch (error) {
        console.error('Không thể phát luồng:', error);
    }
}

// Hàm đóng luồng video
function closeStream(stream) {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

// Hàm khởi tạo Peer
function initializePeer(id, usename) {
    if (peer) {
        peer.destroy();
    }

    peer = new Peer(id);

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
        const remoteId = $('#remoteId').val();

        openStream()
            .then(stream => {
                localStream = stream;

                playStream('localStream', localStream);

                const call = peer.call(remoteId, localStream);

                call.on('stream', remoteStream => playStream('remoteStream', remoteStream));

                call.on('error', error => {
                    console.error('Cuộc gọi bị lỗi:', error);
                    closeStream(localStream);
                });
            })
            .catch(error => {
                console.error('Không thể mở luồng:', error);
            });
    });

    // Receiver
    peer.on('call', call => {
        openStream()
            .then(stream => {
                localStream = stream;

                $('#callConfirmation').show();

                $('#btnAccept').click(() => {
                    $('#callConfirmation').hide();
                    call.answer(localStream);

                    playStream('localStream', localStream);

                    call.on('stream', remoteStream => playStream('remoteStream', remoteStream));

                    call.on('error', error => {
                        console.error('Cuộc gọi bị lỗi:', error);
                    });
                });

                $('#btnReject').click(() => {
                    $('#callConfirmation').hide();
                    console.log('Người dùng từ chối cuộc gọi.');
                });
            })
            .catch(error => {
                console.error('Không thể mở luồng:', error);
            });
    });

    // End Call
    $('#btnEndCall').click(() => {
        closeStream(localStream);
        $('#localStream').get(0).srcObject = null;
    });
}

// Sự kiện đăng ký
$('#btnSignUp').click(() => {
    const username = $('#txtUserName').val();
    const id = $('#id').val();
    console.log("id: " + id + ", name: " + username);

    initializePeer(id, username);
});
