<template>
  <div :class="['weekday', {'is--past': past, 'is--today': today, 'is--future': future}]">
    <div class="weekday__header">
      <div class="weekday__title" v-if="weekday">{{weekday}}</div>
      <div class="weekday__date" v-if="fulldate">{{fulldate}}</div>
    </div>
    <form action="" @submit="addTask($event)">
      <input type="text" name="task" placeholder="Nova Tarefa" v-model="task">
    </form>
    <ul class="weekday__list">
      <task v-for="task, index in tasks" :task=task :key=index></task>
    </ul>
  </div>
</template>

<script>
import task from './Task.vue';
import { format, isAfter, isBefore, isValid, isPast, isFuture, differenceInDays, eachDay, isToday, addDays, subDays } from 'date-fns';
import marked from 'marked';

export default {
  name: 'weekday',
  data() {
    return {
      task: ""
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
  methods: {
    addTask(event) {
      event.preventDefault();
      var markedRenderer = new marked.Renderer() ;
      markedRenderer.paragraph = function(text) {
        return text + '\n';
      };

      let t = {
        html: marked(this.task, {renderer: markedRenderer, gfm: true}),
        rawtext: this.task,
        duedate: this.date,
        done: false
      }

      this.task = '';

      this.$emit('addTask', t);
    }
  },
  components: {
    task
  },
  props: {
    date: {required: true},
    tasks: {
      type: Array,
      default: () => []
    }
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
      margin-bottom: 1em;
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
    }
  }
</style>
