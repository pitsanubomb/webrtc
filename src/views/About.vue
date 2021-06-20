<template>
  <div class="bg-gray-50 relative w-full">
    <video
      class="object-cover w-screen h-screen"
      id="remoteVideo"
      autoplay
      playsinline
    ></video>
    <div class="absolute m-3 bottom-1 -right-0 w-1/4 border-white border-solid border-2">
      <video id="localVideo" autoplay playsinline muted></video>
    </div>
    <div
      v-if="!stream.isLived && type === `offer`"
      class="absolute bottom-2 left-2"
    >
      invite : {{ shareLink }}
    </div>
  </div>
</template>
<script>
import { computed, onMounted, reactive } from "@vue/runtime-core";
import { useRoute } from "vue-router";
import "@firebase/firestore";
import { updateRoom, getData, firebaseApp } from "@/firebase";
export default {
  setup() {
    const route = useRoute();
    const stream = reactive({
      pc: null,
      videoSrc: null,
      offer: null,
      answer: null,
      isLived: false,
    });
    const shareLink = computed(
      () => `${window.location.origin}/m/${route.params.id}/user`
    );
    const uuid = computed(() => route.params.id);
    const type = computed(() => route.params.type);
    // const autoData = getAutoUpdate(uuid.value);
    // test
    onMounted(() => {
      getLocalMedia();
      // getAutoUpdate(uuid.value)
    });
    const getLocalMedia = async () => {
      console.log(`Get media`);
      // console.log(uuid.value,type.value)
      const lm = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const localStream = lm;
      // let remoteStream = new MediaStream();
      if (lm) {
        stream.videoSrc = lm;
        document.getElementById(`localVideo`).srcObject = stream.videoSrc;
        // document.getElementById(`remoteVideo`).srcObject = remoteStream;
        // Create Peer
        createPeer();
        localStream.getTracks().forEach((element) => {
          console.log(`Add track . . .`);
          stream.pc.addTrack(element, localStream);
          // console.log(stream.pc,element)
        });

        stream.pc.addEventListener("track", (event) => {
          console.log(`Get remote ${event.streams[0]}`);
          // event.streams[0].getTracks().forEach((track) => {
          //   console.log("Add a track to the remoteStream:", track);
          //   remoteStream.addTrack(track);
          // });
          document.querySelector("#remoteVideo").srcObject = event.streams[0];
          console.log(event.streams[0]);
        });
        if (type.value === `offer` && stream.offer === null) {
          console.log(`Set offer . . .`);
          stream.offer = await stream.pc.createOffer();
          await stream.pc.setLocalDescription(stream.offer);
          // stream.answer = await stream.pc.createAnswer()
          const roomWithOffer = {
            offer: {
              type: stream.offer.type,
              sdp: stream.offer.sdp,
            },
          };
          updateRoom(uuid.value, roomWithOffer);
          firebaseApp
            .firestore()
            .collection(`room`)
            .doc(uuid.value)
            .onSnapshot(async (snapshot) => {
              let asData = snapshot.data();
              if (asData.answer && !stream.pc.currentRemoteDescription) {
                stream.answer = asData.answer;
                stream.pc.setRemoteDescription(
                  new RTCSessionDescription(asData.answer)
                );
                console.log(stream.pc);

                firebaseApp
                  .firestore()
                  .collection(`room`)
                  .doc(uuid.value)
                  .collection(`offerCandadate`)
                  .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                      console.log(change);
                      if (change.type === "added") {
                        let data = change.doc.data();
                        stream.pc.addIceCandidate(new RTCIceCandidate(data));
                        stream.isLived = true;
                      }
                    });
                  });
              }
            });
          stream.pc.onicecandidate = (event) => {
            event.candidate &&
              firebaseApp
                .firestore()
                .collection(`room`)
                .doc(uuid.value)
                .collection("offerCandadate")
                .add(event.candidate.toJSON());
          };
        } else if (type.value === `user`) {
          const offerForm = await getData(uuid.value);
          console.log(offerForm.offer);
          stream.pc.setRemoteDescription(
            new RTCSessionDescription(offerForm.offer)
          );
          stream.answer = await stream.pc.createAnswer();
          stream.pc.setLocalDescription(stream.answer);
          const roomWithAnswer = {
            answer: {
              type: stream.answer.type,
              sdp: stream.answer.sdp,
            },
          };
          updateRoom(uuid.value, roomWithAnswer);
          console.log(stream.pc);

          stream.pc.onicecandidate = (event) => {
            event.candidate &&
              firebaseApp
                .firestore()
                .collection(`room`)
                .doc(uuid.value)
                .collection("answerCandadate")
                .add(event.candidate.toJSON());
          };

          firebaseApp
            .firestore()
            .collection(`room`)
            .doc(uuid.value)
            .collection(`offerCandadate`)
            .onSnapshot((snapshot) => {
              snapshot.docChanges().forEach((change) => {
                console.log(change);
                if (change.type === "added") {
                  let data = change.doc.data();
                  stream.pc.addIceCandidate(new RTCIceCandidate(data));
                }
              });
            });
        }
      }
    };

    const createPeer = () => {
      const configuration = {
        iceServers: [
          {
            urls: [
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
            ],
          },
        ],
        iceCandidatePoolSize: 10,
      };

      try {
        stream.pc = new RTCPeerConnection(configuration);
        stream.pc.addEventListener("icegatheringstatechange", () => {
          console.log(
            `ICE gathering state changed: ${stream.pc.iceGatheringState}`
          );
        });
        stream.pc.addEventListener("connectionstatechange", () => {
          console.log(
            `ICE gathering state changed: ${stream.pc.connectionstatechange}`
          );
        });
        stream.pc.addEventListener("signalingstatechange", () => {
          console.log(
            `ICE gathering state changed: ${stream.pc.signalingstatechange}`
          );
        });
        stream.pc.addEventListener("iceconnectionstatechange", () => {
          console.log(
            `ICE gathering state changed: ${stream.pc.iceconnectionstatechange}`
          );
        });
        console.log(stream.pc);
      } catch (error) {}
    };
    return { shareLink, stream, type };
  },
};
</script>
