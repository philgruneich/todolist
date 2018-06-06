<template>
  <section>
    <aside>
      <button type="button" aria-title="Voltar um dia." @click="daysBack(1)">&lt;</button>
      <button type="button" aria-title="Voltar 5 dias." @click="daysBack(5)">&lt;&lt;</button>
      <button type="button" aria-title="Hoje" @click="setDate()">H</button>
    </aside>
    <div class="container">
      <weekday
        :date=date
        v-for="date, index in rangeOfDates"
        :key=index
      ></weekday>
    </div>
    <aside>
      <button type="button" aria-title="Avançar um dia." @click="daysForward(1)">&gt;</button>
      <button type="button" aria-title="Avançar 5 dias." @click="daysForward(5)">&gt;&gt;</button>
    </aside>
  </section>
</template>

<script>
import weekday from './components/Weekday.vue';
import { format, isAfter, isBefore, isValid, isPast, isFuture, differenceInDays, eachDay, isToday, addDays, subDays } from 'date-fns';

export default {
  name: 'Tasks',
  data() {
    return {
      rangeOfDates: []
    };
  },
  created() {
    const today = new Date();

    this.rangeOfDates = eachDay(
      subDays(today, 2),
      addDays(today, 2)
    );
  },
  methods: {
    daysBack(n) {
      this.rangeOfDates = this.rangeOfDates.map((date) => {
        return subDays(date, +n);
      });
    },
    daysForward(n) {
      this.rangeOfDates = this.rangeOfDates.map((date) => {
        return addDays(date, +n);
      });
    },
    setDate(date=new Date()) {
      this.rangeOfDates = eachDay(
        subDays(date, 2),
        addDays(date, 2)
      );
    }
  },
  components: {
    weekday
  }
};
</script>

<style lang="sass" scoped>
  section {
    display: flex;
    max-width: 1024px;
    margin: auto;
  }

  .container {
    flex-grow: 1;
    display: flex;
  }

  aside {
    flex: 0 1 auto;
  }
</style>
