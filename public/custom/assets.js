if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD) {
   location.reload()
}

document.addEventListener("DOMContentLoaded", function() {
    renderMathInElement(document.body, {
      delimiters:[
        {left: "$$", right: "$$", display: true},
        {left: "$", right: "$", display: false},
        {left: "\\(", right: "\\)", display: false},
        {left: "\\[", right: "\\]", display: true}
      ]
    });
});



function init(app) {

  // matrix
  app.component('matrix', {
    props: ["name", "n", "m", "modelValue", "value"],
    emits: ['update:modelValue'],
    data: function () {
      return {
        matrix: [[]]
      }
    },
    mounted () {
      if (this.value){
        this.matrix = JSON.parse(this.value);
      } else if (this.modelValue){
        this.matrix = this.modelValue;
      } else if (!isNaN(parseInt(this.m)) && !isNaN(parseInt(this.n))){
        this.matrix = new Array(Number(this.n));
        for (var i = 0; i < this.n; i++) {
          this.matrix[i] = new Array(Number(this.m)).fill("");
        }
      } else {
        throw "Matrix needs either value, model or n and m attribute.";
      }
    },
    watch: {
      matrix(val){
        this.$emit('update:modelValue', val)
      }
    },
    template:
    `<div class="matrix">
      <div v-for="(row, i) in matrix"><input type="text" v-for="(val, j) in row" v-model="matrix[i][j]" /></div>
      <input type="hidden" :name="name" :value="JSON.stringify(this.matrix)" />
    </div>`
  })

  // matrixlist
  app.component('matrixlist', {
    props: ["name", "max", "modelValue", "value"],
    data: function () {
      return {
        list: [],
        currn: "",
        currm: "",
        modal: false,
        maxlength: 10,
      }
    },
    mounted () {
      if (this.value){
        this.list = JSON.parse(this.value);
      } else if (this.modelValue){
        this.list = this.modelValue;
      }
      if (!isNaN(parseInt(this.max))){
        this.maxlength = this.max;
      }
    },
    methods: {
      addMatrix(){
        let n = parseInt(this.currn);
        let m = parseInt(this.currm);
        if (!isNaN(n) && !isNaN(m) && n>0 && m > 0){
          let matrix = new Array(Number(n));
          for (var i = 0; i < n; i++) {
            matrix[i] = new Array(Number(m)).fill("");
          }
          this.list.push(matrix);
        }
        this.currn = "";
        this.currm = "";
      },
      close(){
        this.modal = false;
      },
      open(){
        this.modal = true;
      },
      remove(){
        this.list.pop();
      },
    },
    template:
    `<div class="matrixlist">
      <div v-for="(matrix, i) in list">
        <matrix v-model="list[i]"></matrix>
      </div>
      <input type="button" class="btn" style="margin-right:1em;" v-if="list.length < maxlength" @click="open()" value="+" />
      <input type="button" class="btn" v-if="list.length > 0" @click="remove" value="-" />
      <div class="overlay" v-if="modal">
        <div class="dialog">
        <p>Dimensionen der Matrix eingeben!</p>
        <input type="text" class="small" placeholder="Zeilen" v-model="currn" />
        <input type="text" class="small" placeholder="Spalten" v-model="currm" />
        <input type="button" class="btn" style="margin-right:1em;" value="Abbrechen" @click="close()" />
        <input type="button" class="btn" value="Ok" @click="addMatrix();close()" />
        </div>
      </div>
      <input type="hidden" :name="name" :value="JSON.stringify(this.list)" />
    </div>`
  })

  // truefalse
  app.component('truefalse', {
    props: ["name", "questions", "modelValue", "value"],
    data: function () {
      return {
        answers: [],
        text: []
      }
    },
    mounted () {
      if (this.questions){
        this.text = JSON.parse(this.questions);
      }
      this.answers = [[]];
      if (this.value){
        this.answers = JSON.parse(this.value).map((val) => {
          if (val == "noanswer")
            return [];
          return [val];
        });
      } else if (this.modelValue){
        this.answers = this.modelValue;
      }
      if (this.text.length != this.answers.length){
        this.answers = new Array(this.text.length).fill([]);
      }
    },
    computed: {
      result(){
        return JSON.stringify(this.answers.map((val) => {
          if (val.length == 0)
            return "noanswer";
          return val[0];
        }));
      }
    },
    watch: {
        answers: {
          handler: function () {
            for (let i = 0; i < this.answers.length; i++) {
              if (this.answers[i].length == 2){
                this.answers[i].shift();
              }
            }
          },
          deep: true
        }
      },
    template:
    `<div class="truefalse">
      <div class="info"><span class="material-icons">info</span><div class="info-text">
      <h3>Bewertung:</h3>
      $\\frac{1}{4}\\max(0,(\\#\\text{korrekten Antworten}−\\#\\text{falsche Antworten}))$. Es lohnt sich also nicht zu raten.
      </div></div>
      <ul class="gray-box">
        <li v-for="(question, i) in text">
           <div v-html="question"></div>
           <div class="input">
             <label :for="name+i+'_t'">
               <input type="checkbox" value="ja" :id="name+i+'_t'" v-model="answers[i]" />
               <span>Gilt</span></label>
             <label :for="name+i+'_f'">
               <input type="checkbox" value="nein" :id="name+i+'_f'" v-model="answers[i]" />
               <span>Gilt nicht</span>
             </label>
           </div>
        </li>
      </ul>
      <input type="hidden" :name="name" :value="result" />
    </div>`
  })

  // truefalse
  app.component('radio', {
    props: ["name", "answers", "modelValue", "value"],
    data: function () {
      return {
        answer: "",
        text: []
      }
    },
    mounted () {
      if (this.answers){
        this.text = JSON.parse(this.answers);
      }
      this.answer = "";
      if (this.value){
        this.answer = this.value
      } else if (this.modelValue){
        this.answer = this.modelValue;
      }
    },
    template:
    `<div class="radio">
      <ul class="my-box">
        <li v-for="(answ, i) in text">
          <label :for="name+i" :class="{selected: parseInt(answer) === i}">
            <div v-html="answ"></div>
            <div class="input">
              <input type="radio" :value="i" :name="name" :id="name+i" v-model="answer" />
              <span>&nbsp;</span>
            </div>
          </label>
        </li>
      </ul>
    </div>`
  })

  app.component('text-input', {
    props: ["name", "placeholder", "value"],
    data: function () {
      return {
      }
    },
    template:
    `<div class="text">
      <input type="text" :name="name" :placeholder="placeholder" :value="value"  />
    </div>`
  })

  app.component('math-input', {
    props: ["name", "placeholder", "value", "modelValue"],
    emits: ['update:modelValue'],
    data: function () {
      return {
        latex: "",
        text: "",
      }
    },
    methods:{
      handleInput(e){
        let $this = this;
        let domain = window.location.origin;
        let port = 8000;
        let url = `${domain}:${port}/api`;
        fetch(url, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({"string": this.text})
          })
          .then(
            function(response) {
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
              }
              // Examine the text in the response
              response.json().then(function(data) {
                if (data.ret){
                  $this.latex = "$"+data.ret+"$";
                } else {
                  $this.latex = data.err;
                }
              });
            }
          )
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
      }
    },
    mounted () {
      if (this.value){
        this.text = this.value;
      } else if (this.modelValue){
        this.text = this.modelValue;
      }
      if (this.text != ""){
        this.handleInput();
      }
    },
    watch: {
      text(val){
        this.$emit('update:modelValue', val)
      },
      latex(val){
        Vue.nextTick(() => {
          renderMathInElement(this.$refs.math, {
            delimiters:[
              {left: "$$", right: "$$", display: true},
              {left: "$", right: "$", display: false},
              {left: "\\(", right: "\\)", display: false},
              {left: "\\[", right: "\\]", display: true}
            ]
          });
        })
      }
    },
    template:
    `<div class="text">
      <input @input="handleInput" type="text" :name="name" :placeholder="placeholder" v-model="text" />
      <pre class="math" ref="math">{{ latex }}</pre>
    </div>`
  })

  app.component('draw', {
      props: {"src": String, "linewidth": {"default": 4}, "value": {"default": ""}},
      data() {
         return {
            ctx: null,
            flag: false,
            currX: null,
            currY: null,
            DrawingCanvas: null,
            base64: ""
       }
     },
     methods:{
       draw(prevX, prevY, currX, currY) {
          let ctx = this.ctx;
          if (ctx) {
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.fillRect(this.currX-1, this.currY-1, 2, 2);
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(currX, currY);
            ctx.strokeStyle = "black";
            ctx.lineWidth = this.linewidth;
            ctx.stroke();
            ctx.closePath();
          }
        },
        findxy(res, e) {
          if (e.which != 1) {
              return
          }
          // https://stackoverflow.com/questions/2368784/draw-on-html5-canvas-using-a-mouse
          function getMousePos(canvas, evt) {
              var rect = canvas.getBoundingClientRect();
              return {
                  x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
                  y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
              };
          }
          if (res == 'down') {
            let ctx = this.ctx;
            this.currX = getMousePos(this.DrawingCanvas,e).x;
            this.currY = getMousePos(this.DrawingCanvas,e).y;

            this.flag = true;
            if (ctx) {
              ctx.beginPath();
              ctx.fillStyle = "black";
              ctx.fillRect(this.currX-1, this.currY-1, 2, 2);
              ctx.closePath();
            }
          } else if (res == 'move' || res == "out") {
            if (this.flag) {
              let prevX = this.currX;
              let prevY = this.currY;
              this.currX = getMousePos(this.DrawingCanvas,e).x;
              this.currY = getMousePos(this.DrawingCanvas,e).y;
              this.draw(prevX, prevY, this.currX, this.currY);
            }
          }
          if (res == 'up' || res == "out") {
            this.flag = false;
          }
          this.base64 = this.DrawingCanvas.toDataURL('image/png', 0.15);
        },
        clearDrawing() {
          let ctx = this.ctx;
          if (ctx){
            ctx.clearRect(0, 0, this.DrawingCanvas.width, this.DrawingCanvas.height);
            this.base64 = this.DrawingCanvas.toDataURL();
          }
        },
        move(e){
          return this.findxy('move', e)
        },
        down(e){
          return this.findxy('down', e);
        },
        up(e){
          return this.findxy('up', e);
        },
        out(e){
          return this.findxy('out', e);
        },
     },
     mounted() {
        this.ctx = this.$refs.select.getContext("2d");
        var ctx = this.ctx;
        this.DrawingCanvas = this.$refs.select;
        if (this.value != undefined){
          var image = new Image();
          image.onload = function() {
            ctx.drawImage(image, 0, 0);
          };
          image.src = this.value;
          this.base64 = this.value;
        }

     },
     template: `
     <div>
       <div style="position: relative;top:0;left:0; height: inherit">
         <canvas style='cursor:crosshair;box-shadow:0px 0px 10px grey;position:absolute;top:0;left:0;width:100%;height:100%' width='256' height='256' ref='select' @mousedown='down' @mouseout='out' @mousemove='move' @mouseup='up'></canvas>
         <img style="display: block" :src="src?src:'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='" style="width:100%;height:100%">
       </div>
       <input type="hidden" :value="base64" /><button @click="clearDrawing">Clear</button>
     </div>`
  });

  app.component('sortable', {
    props: ["name", "options", "modelValue", "value"],
    emits: ['update:modelValue'],
    data: function () {
      return {
        initialorder: [],
        order: [],
        sortableobj: null,
      }
    },
    mounted () {
      if (this.value){
        this.initialorder = JSON.parse(this.value);
      } else if (this.modelValue){
        this.initialorder = this.modelValue;
      } else {
        this.initialorder = Array.from({length: JSON.parse(this.options).length}, (x, i) => i).map((i) => String(i))
      }
      let $this = this;
      this.sortableobj = new Sortable(this.$refs.ol, {
        animation: 150,
        ghostClass: 'blue-background-class',
        onChange: function (evt) {
          $this.order = $this.sortableobj.toArray();
        },
      });

    },
    watch: {
      order(val){
        this.$emit('update:modelValue', val)
      }
    },
    template:
    `<div class="sortable">
      <ol ref="ol" class="gray-box">
        <li :key="i" :data-id="i" v-for="i in initialorder">{{ JSON.parse(options)[i] }}</li>
      </ol>
      <input type="hidden" :name="name" :value="'['+order+']'" />
    </div>
    `
  })

}
