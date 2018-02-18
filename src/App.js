import React, {Component} from 'react';
import './App.css';
import * as _ from 'lodash';
import * as axios from 'axios';
import * as ActionCable from 'actioncable'

const actionCableURL = 'wss://bingo.iftrue.de/cable';
const webURL = 'https://bingo.iftrue.de/v1';


class App extends Component {
    constructor() {

        super();

        const boardId = localStorage.getItem('boardId') || null;

        this.state = {
            isConnected: false,
            boardId: boardId,
            tiles: null,
            isSharingOpen: false,
            isSharingIdCorrect: true
        };


    }

    initAndManageConnectionToSocket(boardId) {

        const setConnectionState = (connectionState) => {
            this.setState({
                isConnected: connectionState
            })
        };

        window.acConsumer = ActionCable.createConsumer(actionCableURL);
        this.bingoSub = window.acConsumer.subscriptions.create('BingoChannel', {
            connected: function() {
                if(boardId)
                    this.perform('select_id', {id: boardId});

                setConnectionState(true)
            },
            disconnected: () => {
                setConnectionState(false)
            },
            received: ({field}) => {
                this.setState({
                    tiles: field.tiles
                })
            }
        })
    }

    componentWillMount() {


        if(this.state.boardId) {
            axios.get(webURL + '/field/show/' + this.state.boardId).then((res) => {


                this.setState({
                    tiles: res.data.tiles
                });

                this.initAndManageConnectionToSocket(this.state.boardId)
            })
        } else {

            axios.get(webURL + '/field/new').then((res) => {

                this.setState({
                    boardId: res.data.id,
                    tiles: res.data.tiles
                });


                localStorage.setItem('boardId', res.data.id);

                this.initAndManageConnectionToSocket(res.data.id)
            })
        }
    }


    reshuffleField() {
        axios.post(webURL + `/field/newtiles/${this.state.boardId}`);
    }

    triggerField(tile, index) {
        axios.post(webURL + `/field/toggle/${this.state.boardId}/${index}`);
        tile.checked = !tile.checked;
    }

    toggleSharing() {
        this.setState( {
            isSharingOpen: !this.state.isSharingOpen
        })
    }

    joinGame() {

        if(!this.state.isSharingIdCorrect)
            return;

        const newBoardId = this.sharingCodeInput.value;
        localStorage.setItem('boardId', newBoardId);

        window.location.reload();

    }

    checkSharingId() {
        const newBoardId = this.sharingCodeInput.value;

        axios.get(`${webURL}/field/show/${newBoardId}`)
            .then(() => this.setState({isSharingIdCorrect: true}))
            .catch(() => this.setState({isSharingIdCorrect: false}))

    }

    renderSharing() {

        const textFieldCss = {
            backgroundColor: this.state.isSharingIdCorrect ? 'lightGreen' : 'red',
        };

        return (
            <div className={'ButtonGroup'}>
                <input className={'SecretField'} style={textFieldCss} onKeyUp={this.checkSharingId.bind(this)} ref={ref => this.sharingCodeInput = ref} defaultValue={this.state.boardId} type="text">

                </input>
                <button className={'Button'}
                onClick={this.joinGame.bind(this)}>
                    Beitreten
                </button>
            </div>
        )
    }

    render() {

        if(!this.state.tiles || !this.state.isConnected)
            return null;

        return (
            <div className="AppWrapper">
                <div className="App">
                    <h1> BanaBingo </h1>
                    <div className="Bingo">
                        {this.state.tiles.map((tile, index) => {
                            return (
                                <div
                                    onClick={() => this.triggerField(tile, index)}
                                    className={"BingoField" + (tile.checked ? ' BingoFieldSelected' : '')}
                                    key={index}
                                >
                                        <span>
                                        {tile.text}
                                        </span>
                                </div>
                            )
                        })}
                    </div>
                    <div className={'ButtonGroup'}>
                        <button
                            onClick={this.reshuffleField.bind(this)}
                            className={'Button'}
                        >
                            Neues Feld
                        </button>
                        <button
                            onClick={this.toggleSharing.bind(this)}
                            className={'Button'}
                        >
                            Teilen / Beitreten
                        </button>
                    </div>
                    {this.state.isSharingOpen ? this.renderSharing() : null}

                </div>
            </div>
        )
    }
}

export default App;
