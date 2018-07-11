<template>
  <div class="upcoming">
    <h2 class="upcoming__headline">Upcoming</h2>
    <ul class="upcoming__list">
      <li class="upcoming__item" v-for="task, index in tasks" :key="task.id">
        <div v-if="index === 0 || isDifferentDay(index)" class="upcoming__header">{{fulldate(task.duedate)}}</div>
        <a href="#" @click.prevent="$emit('goto', task.duedate);" class="upcoming__button">
          <span class="upcoming__title" v-html="task.html"></span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { format, isSameDay } from 'date-fns';

export default {
  name: 'upcoming',
  data() {
    return {};
  },
  methods: {
    fulldate(d) {
      return format(d, 'DD MMM');
    },
    isDifferentDay(index) {
      return !isSameDay(this.tasks[index].duedate, this.tasks[index - 1].duedate);
    }
  },
  props: {
    tasks: {required: true}
  }
};
</script>

<style lang="sass" scoped>
  .upcoming {
    flex: 1 0 20%;
    padding: 1em;
    font-family: sans-serif;

    &__header {
      // text-align: center;
      margin-top: .5em;
      margin-bottom: .5em;
      text-transform: uppercase;
    }

    &__title {
      text-transform: uppercase;
      font-weight: 700;
    }

    &__date {
      font-size: .75em;
    }

    &__list {
      padding: 0;
      list-style: none;
      margin: 0;
      min-height: 200px;
    }
  }
</style>
