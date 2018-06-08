<template>
  <li class="task">
    <input type="checkbox" v-model="task.done" />
    <div v-html="task.html" :class="{'is--done': task.done}"></div>
  </li>
</template>

<script>
export default {
  name: 'task',
  data() {
    return {

    };
  },
  props: {
    task: {required: true}
  }
};
</script>

<style lang="sass" scoped>
  .task {
    display: flex;
    p {
      margin: 0;
    }
  }

  .task p {
    margin: 0;
  }

  .is--done {
    text-decoration: line-through;
  }
</style>