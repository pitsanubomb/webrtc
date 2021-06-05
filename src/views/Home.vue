<template>
  <div class="container">
    <div
      class="
        my-10
        mx-auto
        bg-white
        rounded-xl
        shadow-md
        overflow-hidden
        md:max-w-4xl
      "
    >
      <div class="md:flex m-10">
        <div class="md:flex-initial">
          <video
            class="object-contain w-full h-full"
            id="demoVideo"
            autoplay
            playsinline
          ></video>
        </div>
        <div class="md:flex-initial">
          <input
            v-model="form.title"
            type="text"
            class="form-input px-4 py-3 ml-5 rounded-xl"
            placeholder="หัวข้อ"
          />
          <input
            type="text"
            readonly
            v-model="id.uuid"
            class="form-input px-4 py-3 ml-5 rounded-xl mt-1.5"
            placeholder="url"
          />
          <div class="md:flex">
            <!-- aaaa -->
            <!-- <button class="bg-green-900 mx-auto round-xl mt-2">aaaa</button> -->
            <div class="inline-flex ml-5 mt-2 rounded-md shadow">
            <router-link :to="`/m/${id.uuid}/offer`">
              <div
                class="
                  inline-flex
                  items-center
                  justify-center
                  px-5
                  py-3
                  text-base
                  font-medium
                  leading-6
                  text-white
                  transition
                  duration-150
                  ease-in-out
                  bg-green-800
                  border border-transparent
                  rounded-md
                  hover:text-white
                  focus:outline-none
                "
              >
                Start
              </div>
            </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { onMounted, reactive } from "@vue/runtime-core";
import { createRoom } from "@/firebase";
export default {
  setup() {
    const form = reactive({ title: "TestRoom",offer:null});
    const id = reactive({uuid:""});
    onMounted(() => {
      setMedia();
    });
    const setMedia = async () => {
      const m = await openMediaDevices({ video: true, audio: false });
      console.log(`Get medai form device . . .`);
      if (m) {
        genRoom()
        console.log(`Set medai . . .`);
        document.getElementById(`demoVideo`).srcObject = m;
      }
    };

    const openMediaDevices = async (constraints) => {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        alert(`Have error . . . ${error}`);
      }
    };
    const genRoom = async () => {
      if (form.title) {
        let a = await createRoom(form);
        id.uuid = a.id
        console.log(`Id is . . . ${id.uuid}`)
      }
    };
    return { form, id };
  },
};
</script>
