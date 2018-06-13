<template>
  <div class="task">
    <input type="checkbox" v-model="task.done" @change="toggleTask(task)" />
    <div v-html="visibleTask" :class="{'is--done': task.done}" :contenteditable="!task.done" @focus="visibleTask = task.rawtext" @blur="editTask($event)"></div>
  </div>
</template>

<script>
import marked from 'marked';

export default {
  name: 'task',
  data() {
    return {
      visibleTask: ''
    };
  },
  methods: {
    toggleTask(task) {
      this.$emit('update', task);
    },
    editTask(event) {
      let markedRenderer = new marked.Renderer() ;
      markedRenderer.paragraph = function(text) {
        return text + '\n';
      };

      let rawtext = event.target.textContent;
      let newHtml = marked(rawtext, {renderer: markedRenderer, gfm: true});

      this.visibleTask = newHtml;

      this.task.rawtext = rawtext;
      this.task.html = newHtml;

      this.$emit('update', this.task);
    }
  },

  mounted() {
    this.visibleTask = this.task.html;
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
