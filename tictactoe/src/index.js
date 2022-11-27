import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'

// <button>을 렌더링
// 값을 표시하기 위해 render함수에 부모 Board 컴포넌트에서 자식 Square 컴포넌트로 "prop을 전달"
// Square 컴포넌트를 클릭하면 "X"가 체크되도록 하려면 Square 컴포넌트의 render()함수에서 반환하는 버튼 태그 만들기
// Square 컴포넌트를 클릭한것을 "기억"하게 만들어 "X" 표시 채워 넣기 => state 사용
// 현재 게임의 state를 각각의 Square 컴포넌트에서 유지하고 있다.
// 승자를 확인하기 위해 9개의 사각형의 값을 한 곳에 유지할 것. => 각 Square가 아닌 부모 Board 컴포넌트에 게임의 상태를 저장하는 것이 가장 좋은 방법.
// 여러개의 자식으로부터 데이터를 모으거나 두 개의 자식 컴포넌트들이 서로 통신하게 하려면 부모 컴포넌트에 공유 state를 정의해야 한다.
// 부모 컴포넌트는 props를 사용해 자식 컴포넌트에 state를 다시 전달할 수 o. => 자식 컴포넌트들이 서로 또는 부모 컴포넌트와 동기화 하도록 만듦.
// Square 컴포넌트가 더 이상 state를 유지하지 않기 때문에 Square 컴포넌트에서 값을 받아 클릭될 때 Board 컴포넌트로 정보를 전달한다.
// Square 컴포넌트는 이제 제어되는 컴포넌트다 => Board는 Square를 완전히 제어한다.
// Square를 함수컴포넌트로 바꾸고 this.props를 props로 변경
function Square(props) {
    return (
      <button
        className="square" 
        onClick={props.onClick}
      >
        {props.value}
      </button>
    );
  }

// 사각형 9개를 렌더링
// Board에 생성자 추가하고 9개의 사각형에 해당하는 9개의 null 배열을 초기 state로 설정
// 나중에 board를 채우면 this.state.squares배열은
// [
//   'O', null, 'X'
//   'X', 'X', 'O'
//   'O', null, null
// ] 로 보일 것.
class Board extends React.Component {
  renderSquare(i) {
    // Square에 value prop을 전달
    // 처음에는 0~8까지 숫자를 보여주기 위해 Board에서 value prop을 자식으로 전달했다.
    // 또 다른 이전 단계에서는 숫자를 Square의 자체 state에 다라 "X" 표시로 바꿨다 => 그렇기 때문에 현재 Square는 Board에 전달한 value prop을 무시하고있다.
    // 이제 prop을 전달하는 방법을 다시 사용할 것.
    // 각 Square에게 현재 값을 표현하도록 Board에 수정.
    return (
      <Square 
        value={this.props.squares[i]} 
        onClick={()=> this.props.onClick(i)}
        />
        // 이렇게 바꿔줌으로써 이제 빈 사각형에 'X', 'O', 또는 null인 value prop을 받는다.
        // Board에서 Square로 함수를 전달하고 Square는 사각형을 클릭할때 함수를 호출한다.
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

// 게임판을 렌더링하고, 나중에 수정할 자리 표시자 값을 가지고 있다.
class Game extends React.Component {
  // Game컴포넌트의 생성자 안에 초기 state 설정
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      // jumpTo 함수를 구현하기 전에 Game컴포넌트의 state에 stepNumber를 추가해 현재 진행중인 단계를 표시
      stepNumber: 0,
      xIsNext: true,
    }
  }

  // handleClick 함수 추가
  // 이제 state가 각 Square 컴포넌트 대신에 Board 컴포넌트에 저장된다.
  // Board의 상태가 변화할 때 Square 컴포넌트는 자동으로 다시 렌더링한다.
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    // .slice()연산자를 이용한 이유 => 불변성 때문
    // 불변성의 특징: 복잡한 특징들을 단순하게 만들고, 변화를 감지하고, React에서 다시 렌더링하는 시기를 결정한다.
    // handleClick 함수를 수정해 xIsNext의 값 뒤집기 => 이렇게 함으로써 x와 o는 번갈아 가면서 나타남.
    const squares = current.squares.slice();
    // 누군가 승리하거나 Square가 이미 채워졌다면 Board의 handleClick 함수가 클릭을 무시하도록 변경
    if(calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
        history: history.concat([
          {
            squares: squares
          }
        ]),
        // stepNumber state는 현재 사용자에게 표시되는 이동을 반영한다.
        // 새로운 이동을 만든 후에 this.state의 인자로 stepNumber: history.length를 추가해 stepNumber를 업데이트 해야한다. => 이를 통해 새로운 이동이 생성된 후에 이동이 그대로 남아있는 것을 방지
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
    });
  }
  // jumpTo 함수가 정의되어있지 않아 리스트 아이템의 버튼을 클릭하면 에러가 발생해 jumpTo함수 구현하기
  // jumpTo 함수에서 state의 history 프로퍼티를 업데이트 하지 x => 이는 state의 업데이트가 병합되거나 React는 나머지 state를 그대로 두고 setState 함수에 프로퍼티만 언급하기 때문
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      // stepNumber가 짝수일 때마다 xIsNext를 true로 설정
      xIsNext: (step%2) === 0,
    });
  }

  render() {
    // Game 컴포넌트의 render 함수를 가장 최근 기록을 사용하도록 업데이트해 게임의 상태를 확인하고 표시하기
    // render()안에 있는 status 텍스트도 바꿔서 어느 플레이어가 다음 차례인지 알려주기
    // 어떤 플레이어가 우승헸는지 확인하기 위해 Board의 rander 함수에서 calculateWinner(squares)를 호출할 것.
    const history = this.state.history;
    // 항상 마지막 이동을 렌더링 하는 대신 stepNumber에 맞는 현재 선택된 이동을 렌더링 할 것
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    
    // history 배열을 순회하면서 step 변수를 현재 history 요소의 값을 참조해 move는 현재 history 요소의 인덱스를 참조한다.
    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        // key 값 넣어주기
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      )
    })

    let status;
    if(winner) {
      status = 'Winner: ' + winner;
    }else{
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O')
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

// 승자 결정하는 함수 추가
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}