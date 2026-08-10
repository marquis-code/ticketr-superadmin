<template>
  <div class="relative" ref="dropdownRef">
    <button 
      type="button" 
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:border-primary transition"
    >
      <span :class="modelValue ? 'text-gray-900' : 'text-gray-400'">
        {{ selectedLabel || placeholder }}
      </span>
      <ChevronDown class="w-4 h-4 text-gray-400 transition-transform" :class="isOpen ? 'rotate-180' : ''" />
    </button>
    
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="isOpen" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
        <ul class="py-1 text-sm text-gray-700">
          <li 
            v-for="option in options" 
            :key="option.value"
            @click="selectOption(option)"
            class="px-3 py-2 cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 transition"
            :class="modelValue === option.value ? 'bg-emerald-50 text-emerald-700 font-semibold' : ''"
          >
            {{ option.label }}
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    required: true, // [{ label: 'Flat (₦)', value: 'FLAT' }]
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const dropdownRef = ref(null);

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : '';
});

function selectOption(option) {
  emit('update:modelValue', option.value);
  isOpen.value = false;
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>
