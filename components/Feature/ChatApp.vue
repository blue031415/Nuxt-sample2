<script setup lang="ts">
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/schema";
import { ref, onMounted, watch } from "vue";
import { dateToString } from "@/utils/dateToString";

import useDatabase from "@/composable/useDatabase";
import useAuth from "@/composable/useAuth";

const nuxtApp = useNuxtApp();
const supabase = nuxtApp.$supabase as SupabaseClient;

const scrollAreaRef = ref<HTMLElement | null>(null);
const editingMessageId = ref("");
const inputText = ref("");
const messages = ref<Database["public"]["Tables"]["messages"]["Row"][]>([]);
const { session: isLogin, profileFromGithub } = useAuth();
const {
  data,
  fetchDatabase,
  addSupabaseData,
  deletedSupabaseData,
  editedSupabaseData,
  TABLE_NAME,
} = useDatabase();

const router = useRouter();

// ログアウト済みの場合はログインページにリダイレクト
if (!isLogin) router.push("/");

const scrollToBottom = () => {
  if (scrollAreaRef.value) {
    scrollAreaRef.value.scrollTop = scrollAreaRef.value.scrollHeight;
  }
};

const fetchRealtimeData = () => {
  try {
    supabase
      .channel("table_postgres_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: TABLE_NAME,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const { createdAt, id, message, avatarUrl, nickName } = payload.new;
            messages.value = [
              ...messages.value,
              { createdAt, id, message, avatarUrl, nickName },
            ];
          }
          if (payload.eventType === "DELETE") {
            const { id } = payload.old;
            messages.value = messages.value.filter((item) => item.id !== id);
          }
          if (payload.eventType === "UPDATE") {
            const { id, message } = payload.new;
            messages.value = messages.value.map((item) =>
              item.id === id ? { ...item, message } : item,
            );
          }
        },
      )
      .subscribe(); // subscribeで初期化作業が必要
  } catch (error) {
    console.error(error);
  }
};

// 初回のみ全データフェッチとリアルタイムリスナー登録
onMounted(async () => {
  await fetchDatabase();
  messages.value = !data.value ? [] : data.value;
  fetchRealtimeData();
  await nextTick();
  scrollToBottom();
});

const onChangeInputText = (event: Event) => {
  const target = event.target as HTMLInputElement;
  inputText.value = target.value;
};

const onSubmitNewMessage = (event: Event) => {
  event.preventDefault();
  if (!inputText.value) return;
  addSupabaseData({ message: inputText.value, ...profileFromGithub.value });
  inputText.value = "";
};

const onMessageDeleted = async (id: string) => {
  await deletedSupabaseData(id);
};

const onMessageEdited = (id: string) => {
  editingMessageId.value = id;
};

const onSaveEditedMessage = async (id: string, newMessage: string) => {
  await editedSupabaseData(id, newMessage); // DBの更新ロジックを実装する
  editingMessageId.value = ""; // 編集モードを終了
};

watch(messages, () => {
  scrollToBottom();
});
</script>
<template>
  <div class="flex flex-col h-screen">
    <div
      ref="scrollAreaRef"
      class="flex-grow overflow-y-auto pt-20 pb-20 px-4 bg-gray-100"
    >
      <div
        class="mt-8"
        v-for="item in messages"
        :key="item.id"
        :data-my-chat="item.nickName === profileFromGithub.nickName"
      >
        <div
          :class="[
            'flex',
            'items-start',
            'mb-2',
            item.nickName !== profileFromGithub.nickName && 'flex-row-reverse',
          ]"
        >
          <div
            :class="[
              'flex-shrink-0',
              item.nickName === profileFromGithub.nickName ? 'mr-3' : 'ml-3',
            ]"
          >
            <a
              :href="`https://github.com/${item.nickName}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                v-if="item.avatarUrl"
                :src="item.avatarUrl"
                :alt="item.nickName ? item.nickName : '名無し'"
                class="w-10 h-10 rounded-full border"
              />
              <nuxt-img
                v-else
                src="/noimage.png"
                alt="no image"
                class="w-10 h-10 rounded-full border"
              />
            </a>
          </div>
          <div
            class="relative bg-blue-100 text-blue-900 p-3 rounded-lg min-w-[320px]"
          >
            <p class="absolute left-0 -top-4 z-10 text-[10px]">
              {{ item.nickName }}
            </p>
            <div v-if="item.id !== editingMessageId">
              <p>{{ item.message }}</p>
            </div>
            <div v-else>
              <input
                type="text"
                class="border border-gray-400 p-2 rounded w-full"
                v-model="item.message"
                @blur="onSaveEditedMessage(item.id, item.message as string)"
              />
            </div>
            <p class="absolute text-right text-[10px] -bottom-4 right-0">
              {{ dateToString(item.createdAt, "YYYY/MM/DD HH:mm") }}
            </p>
            <button
              class="absolute text-[10px] left-0 -bottom-4"
              @click="onMessageDeleted(item.id)"
              v-if="item.nickName === profileFromGithub.nickName"
            >
              削除
            </button>
            <button
              class="absolute text-[10px] left-7 -bottom-4"
              @click="onMessageEdited(item.id)"
              v-if="item.nickName === profileFromGithub.nickName"
            >
              編集
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-400 bg-gray-200 p-4">
      <form @submit.prevent="onSubmitNewMessage">
        <div class="flex justify-between items-center">
          <div class="w-10/12">
            <input
              type="text"
              name="message"
              v-model="inputText"
              @input="onChangeInputText"
              class="border border-gray-400 w-full p-2 rounded"
              aria-label="新規メッセージを入力"
            />
          </div>
          <div class="w-2/12 ml-5">
            <button
              type="submit"
              :disabled="!inputText"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded w-full"
            >
              送信
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>