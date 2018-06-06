<template>
  <div :class="['weekday', {'is--past': past, 'is--today': today, 'is--future': future}]">
    <div class="weekday__header">
      <div class="weekday__title" v-if="weekday">{{weekday}}</div>
      <div class="weekday__date" v-if="fulldate">{{fulldate}}</div>
    </div>

  </div>
</template>

<script>
import task from './Task.vue';
import { format, isAfter, isBefore, isValid, isPast, isFuture, differenceInDays, eachDay, isToday, addDays, subDays } from 'date-fns';

export default {
  name: 'weekday',
  data() {
    return {
    };
  },
  computed: {
    weekday() {
      return format(this.date, 'dddd');
    },

    fulldate() {
      return format(this.date, 'DD MMMM, YYYY');
    },

    past() {
      return isPast(this.date);
    },

    today() {
      return isToday(this.date);
    },

    future() {
      return isFuture(this.date);
    }
  },
  components: {
    task
  },
  props: {
    date: {required: true}
  }
};
</script>

<style lang="sass" scoped>
  .weekday {
    flex: 1 0 20%;
    padding: 1em;
    font-family: sans-serif;

    &.is--past {
      color: #778ca3;
    }

    &.is--today {
      color: #eb3b5a;
    }

    &__header {
      text-align: center;
    }

    &__title {
      text-transform: uppercase;
      font-weight: 700;
    }

    &__date {
      font-size: .75em;
    }
  }
</style>
