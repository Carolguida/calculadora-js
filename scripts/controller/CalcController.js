/* Aqui ficará a classe */
// "_" diz que é privado -> encapsulamento
//innerHTML: pega o objeto e coloca uma informação em formato html.

class CalcController {
  constructor() {

    this._audioOnOff = false; // começa desligado o som
    this._audio = new Audio('click.mp3'); // -> atribito para guardar o audio -> Audio : classe da web API

    this._lastOperator = "";
    this._lastNumber = "";

    this._operation = []; // vai guardar a operação
    this._locale = "pt-BR";
    this._displayCalcEl = document.querySelector("#display");
    this._dateEl = document.querySelector("#data");
    this._timeEl = document.querySelector("#hora");

    this._currentDate;
    this.initialize();
    this.initButtonsEvents();
    this.initKeyBoard();
  }

  initialize() {
    this.setDisplayDateTime();

    //executa a data e a hora a cada 1000 milesegundos
    setInterval(() => {
      this.setDisplayDateTime();
    }, 1000);

    this.setLastNumberToDisplay();
    this.pasteFromClipboard();

    // event de duplo click do botão ac -> para eventos de som das teclas (acionar com dois clicks)
    // precisamos fazer o forEach para adicionar o evento em cada um dos botões (serão acionadas duas vezes - 2 botoes)
    document.querySelectorAll('.btn-ac').forEach(btn => {
        
      // em cada botão vou adicionar o evento dblclick (double Click)
      btn.addEventListener('dblclick', e => {
          this.toggleAudio();
        });
    });
  }

  toggleAudio(){

      // maneira mais enxuta -> ternário
      this._audioOnOff = (this._audioOnOff) ? false : true;
      console.log(this._audioOnOff);
      // ou mais enxuta ainda:
      //this._audioOnOff = !this._audioOnOff;

      /* if(this._audioOnOff){
        this._audioOnOff = false;
      }else{
        this._audioOnOff = true;
      } */
  }

  playAudio(){

    // verificar se pode tocar o audio -> então caso true -> play
    if(this._audioOnOff){
      this._audio.currentTime = 0; // toca o audio sempre do inicio (independente da velocidade em que digito/teclo as teclas)
      this._audio.play();
    }
  }

  //método de copiar
  copyToClipboard() {
    // temos que criar um elemento input pq o svg não tem uma opção de select
    // teremos então que criar o input e colocar o valor da calculadora dentro e conseguiremos selecionar
    let input = document.createElement("input");

    // colocando o valor do input dentro da calc
    input.value = this.displayCalc;

    // o input precisa ser inserido dentro da body -> child -> o body "abraça" o input
    // agora o input vai aparecer na tela
    // e então conseguirei selecionar o conteúdo
    // caso eu estivesse utilizando meu codigo HTML, precisaria apenas copiar e selecionar a info
    document.body.appendChild(input);
    input.select();

    // copiar a informação para o sistema operacional -> vai copiar tudo que estará selecionado.
    document.execCommand("Copy");

    // para não aparecer na tela
    input.remove();    
  }

  //método de colar
  pasteFromClipboard(){

    // escutar -> alguem colou algo?
    document.addEventListener('paste', e => {
     let text =  e.clipboardData.getData('Text');

     this.displayCalc = parseFloat(text); // vai gerar no display NaN (não é um numero)
     console.log(text);
    });
  }

  // eventos de botão
  initKeyBoard() {
    // aqui usamos o keyup -> conseguimos capturar no momento qual foi a tecla acionada.
    document.addEventListener("keyup", (e) => {
      
      // vai tocar o audio sempre q apertar botao do teclado
      this.playAudio();

      switch (e.key) {
        case "Escapec":
          this.clearAll();
          break;

        case "Backspace":
          this.clearEntry();
          break;

        case "+":
        case "-":
        case "/":
        case "*":
        case "%":
          this.addOperation(e.key);
          break;

        case "Enter":
        case "=":
          this.calc();
          break;

        case ".":
        case ",":
          this.addDot();
          break;

        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          this.addOperation(parseInt(e.key));
          break;

        case "c":
          if (e.ctrlKey) this.copyToClipboard();
          break;
      }
    });
  }

  // addEventListener: suporta um evento por vez -> precisamos criar nosso evento (um método chamado addEventListenerAll)!
  // Precisamos tb de um forEach para percorrer dois eventos
  // Uso o slipt para separar as Strings -> gera um array -> daí uso o forEach
  // Uso false pq tenho o botão e texto do botão ao mesmo tempo -> isso evita que gere dois números no display (o evento não ira acontecer duas vezes)
  addEventListenerAll(element, events, fn) {
    events.split(" ").forEach((event) => {
      // Em cada elemento eu vou passar um evento!
      element.addEventListener(event, fn, false);
    });
  }

  clearAll() {
    this._operation = [];
    this._lastNumber = "";
    this._lastOperator = "";
    this.setLastNumberToDisplay();
  }

  clearEntry() {
    this._operation.pop();
    this.setLastNumberToDisplay();
  }

  // Vai pegar o ultimo operador dentro do array
  getLastOperation() {
    return this._operation[this._operation.length - 1];
  }

  setLastOperation(value) {
    this._operation[this._operation.length - 1] = value;
  }

  isOPerator(value) {
    //retorna true -> é um operador
    // retorna false -> res = -1 (não é um desses operadores)
    // aqui retorna se existe um operador no array -> caso true 1; caso false -1.
    return ["+", "-", "*", "/", "%"].indexOf(value) > -1;
  }

  pushOperation(value) {
    this._operation.push(value);

    //vai retornar o resultado da conta caso o array contenha mais de 3 itens
    if (this._operation.length > 3) {
      this.calc();
    }
  }

  getResult() {
    // retorna o array em uma string -> pq antes tava um array (que contem virgulas) e o eval nao vai reconhecer, entao é necessario utilizar o join que vai tirar essas virgulas
    // o eval vai realizar a conta que ta ali dentro, no caso de strings
    // ex : eval("10+90") = 100

    try{
      return eval(this._operation.join(""));
    }catch(e){
     setTimeout(() => {
        this.setError();
      }, 1);

      // utilizamos setTimeoUt -> como o método getResult é requisitado por outros métodos, sempre que este método pedir pelo getResult vai colocar zero na tela -> então o setError() nunca vai aparecer caso nao especifique um tempo

      
    }
    
  }

  calc() {
    //Aqui está seguindo a logica da calculadora do pc -> ele calcula em pares

    let last = "";

    //pega o ultimo operador
    this._lastOperator = this.getLastItem();

    // Validação -> será q estou apertando o igual antes de ter 3 itens, pelo menos?
    if (this._operation.length < 3) {
      let firstItem = this._operation[0];
      this._operation = [firstItem, this._lastOperator, this._lastNumber];
    }

    // so podemos tirar o ultimo quando tiver mais de 3 itens no array
    // tira o ultimo elemento e guarda na variavel (o operation ficará com apenas 3 itens)
    //pega o ultimo numero como o resultado -> 2 + 3 + = 5 (pega o 5 como o ultimo numero, no caso o resultado da operação)
    if (this._operation.length > 3) {
      last = this._operation.pop();

      //this._lastOperator = this.getLastItem();
      this._lastNumber = this.getResult();
    } else if (this._operation.length == 3) {
      // caso seja apenas 3 itens no array, vamos pegar o ultimo numero digitado e adicionar no lastNumber
      // -> 5 + 3 = 8 (vai somar sempre + 3) -> então pega o ultimo numero da operação

      //this._lastOperator = this.getLastItem();
      this._lastNumber = this.getLastItem(false);
    }

    let result = this.getResult();

    // precisamos agora verificar para o calculo de porcentagem, pois o % representa módulo, e não é isso que queremos.
    if (last == "%") {
      result /= 100; //result = result/100

      // aqui não precisa adicionar o last (que é o porcento) pois ja caiu na operação
      this._operation = [result];
    } else {
      //salva novo array com o resultado
      this._operation = [result];

      // se last for diferente de vazio, adiciona no array
      // so adiciona o last se realmente existir
      if (last) this._operation.push(last);
    }

    this.setLastNumberToDisplay();
  }

  getLastItem(isOperator = true) {
    //percorrer o array do final ao começo procurando o primeiro numero que encontrar para mostrar no display -> ultimo numero que digitou
    // is Operator = true -> por padrão sempre trará para mim o ultimo operador
    let lastItem;

    // começa do maior valor para o menor
    // length - 1 para acessar o index
    for (let i = this._operation.length - 1; i >= 0; i--) {
      // aqui acha um operador ao percorrer o array
      //isOperador = true
      if (isOperator) {
        if (this.isOPerator(this._operation[i])) {
          lastItem = this._operation[i];
          break;
        }
        // se não for um operador -> achei um numero ao percorrer o array

        // isOperador = false
      } else {
        if (!this.isOPerator(this._operation[i])) {
          lastItem = this._operation[i];
          break;
        }
      }
    }

    // aqui estamos validando caso o ultimo item seja indefinido ou se perca na operação
    // então caso não existir o last item faça -> caso o last item seja o operador (isOperador = true), então seta ele como o this._lastOperator, caso contrário ele será um número, ou seja, será o this._lastNumber.
    if (!lastItem) {
      lastItem = isOperator ? this._lastOperator : this._lastNumber;
    }

    return lastItem;
  }

  setLastNumberToDisplay() {
    let lastNumber = this.getLastItem(false);
    // se for vazio (nao existe), então seta no display o valor zero
    if (!lastNumber) {
      lastNumber = 0;
    }

    this.displayCalc = lastNumber;
  }

  // add botão digitado -> vai adicionar uma operação
  addOperation(value) {
    // Verifica se o ultimo operador não é um numérico
    if (isNaN(this.getLastOperation())) {
      //String (true)

      // no caso de troca de operadores
      if (this.isOPerator(value)) {
        // o ultimo operador será igual ao operador do momento
        this.setLastOperation(value);

        //isso não é um numero?
      } else {
        // no caso de não atender por operador nem por outra coisa, será então um número
        // neste caso é necessário adicionar um push para inserir um numero no array, uma vez que ele inicia vazio
        this.pushOperation(value);
        this.setLastNumberToDisplay();
      }
    } else {
      //Number(false)

      //se o ultimo digitado é um numero e agora eu digito um operador, vai cair no else e eu devo fazer também a verificação
      if (this.isOPerator(value)) {
        this.pushOperation(value);
      } else {
        let newValue = this.getLastOperation().toString() + value.toString();
        // pego o ultimo valor
        this.setLastOperation(newValue);

        //atualizar display
        this.setLastNumberToDisplay();
      }
    }
  }

  setError() {
    this.displayCalc = "Error";
  }

  addDot() {
    let lastOperation = this.getLastOperation();

    // Precisamos verificar se a operação existe e se ja possui um ponto
    // preciso primeiro verificar o tipo do lastOperation -> pq apenas da para fazer o split em string
    if (
      typeof lastOperation === "string" &&
      lastOperation.split("").indexOf(".") > -1
    )
      return;

    // Aqui vamor verificar se é um operador
    // se o operador (2+0.) for o ultimo operador digitado ou se ele não existir (undefined):
    if (this.isOPerator(lastOperation) || !lastOperation) {
      this.pushOperation("0.");
    } else {
      // se não for um operador e também não é vazio -> então é um numero
      // nesse caso vou transformar em uma string e adicionar (concatenar) o ponto
      this.setLastOperation(lastOperation.toString() + ".");
    }
   
    this.setLastNumberToDisplay();
  }

  execBtn(value) {

    // vai tocar o audio sempre q apertar botao da tela
    this.playAudio();

    switch (value) {
      case "ac":
        this.clearAll();
        break;

      case "ce":
        this.clearEntry();
        break;

      case "soma":
        this.addOperation("+");
        break;

      case "subtracao":
        this.addOperation("-");
        break;

      case "divisao":
        this.addOperation("/");
        break;

      case "multiplicacao":
        this.addOperation("*");
        break;

      case "porcento":
        this.addOperation("%");
        break;

      case "igual":
        this.calc();
        break;

      case "ponto":
        this.addDot();
        break;

      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        this.addOperation(parseInt(value));
        break;

      default:
        this.setError();
        break;
    }
  }

  initButtonsEvents() {
    // ">" aqui pega todas as tags 'g' que são filhas de buttons e parts
    let buttons = document.querySelectorAll("#buttons > g , #parts > g");

    buttons.forEach((btn) => {
      this.addEventListenerAll(btn, "click drag", (e) => {
        let textBtn = btn.className.baseVal.replace("btn-", "");

        //executa a ação do botão e mando o valor do botão tb (textBtn)
        this.execBtn(textBtn);
      });

      this.addEventListenerAll(btn, "mouseover mouseup mousedown", (e) => {
        btn.style.cursor = "pointer";
      });
    });
    //baseVal : como ta em svg tem que colocar isso.
  }

  //metodo de atualizar hora e data
  setDisplayDateTime() {
    this.displayDate = this.currentDate.toLocaleDateString(this._locale);
    this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
  }

  //getters and setters
  get displayTime() {
    return this._timeEl.innerHTML;
  }

  set displayTime(value) {
    this._timeEl.innerHTML = value;
  }

  get displayDate() {
    return this._dateEl.innerHTML;
  }

  set displayDate(value) {
    this._dateEl.innerHTML = value;
  }

  get displayCalc() {
    return this._displayCalcEl.innerHTML;
  }

  set displayCalc(value) {

    if(value.toString().length > 10){
      this.setError();
      return false;
    }

    this._displayCalcEl.innerHTML = value;
  }

  get currentDate() {
    return new Date();
  }

  set currentDate(value) {
    this._currentDate = value;
  }
}
