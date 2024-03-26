<script lang="ts" setup>
import useAuth from "@/composable/useAuth";

const { signOut } = useAuth();
</script>

<template>
  <div class="wrapper">
    <button
      class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      @click="signOut"
    >
      ログアウト
    </button>
  </div>
</template>