import React, {Component} from 'react';
import './App.css';
import * as _ from 'lodash';
import * as axios from 'axios';


const banaBingoURL = 'https://raw.githubusercontent.com/AreonDev/BanaBINGO/master/BanaBINGO.txt';


class App extends Component {

    constructor() {

        super();
        this.state = {
            selectedFields: [],
            bingoEntries: []
        };


        const potentialState = localStorage.getItem('state');

        if(potentialState) {
            this.state = JSON.parse(potentialState)
        } else {
            this.refreshBingo();
        }
    }

    refreshBingo() {
        axios.get(banaBingoURL).then((content) => {
            const newBingoEntries = _.shuffle(String(content.data).split('\n').filter(c => !!c));
            this.setState({
                bingoEntries: newBingoEntries,
                selectedFields: []
            })
        })
    }

    triggerField(index) {

        const newSelectedFields = [...this.state.selectedFields];
        newSelectedFields[index] = !newSelectedFields[index];


        this.setState({
            selectedFields: newSelectedFields
        }, () => {
            const stringifiedState = JSON.stringify(this.state);
            localStorage.setItem('state', stringifiedState);
        });

    }

    render() {

        const editWindowStyle={
            width: '300px'
        };

        if(this.state.bingoEntries.length <= 0)
            return null;

        return (
            <div className="AppWrapper">
                <div className="App">
                    <h1> BanaBingo </h1>
                    <div className="Bingo">
                        {_.range(0,25).map(index => {
                            return (
                                <div
                                    onClick={() => this.triggerField(index)}
                                    className={"BingoField" + (this.state.selectedFields[index] ? ' BingoFieldSelected' : '')}
                                    key={index}
                                >
                                        <span>
                                        {this.state.bingoEntries[index]}
                                        </span>
                                </div>
                            )
                        })}
                    </div>
                    <div>
                        <button onClick={this.refreshBingo.bind(this)} className={'Button'}>
                            Neues Feld
                        </button>
                    </div>
                </div>
                <div className="EditWindow" style={editWindowStyle}>
                    {_.range(20).map(i => {
                        return (
                            <div className={"EditWindowItem"} key={i}>
                                <input type={'text'} value={i}/>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

    export default App;
