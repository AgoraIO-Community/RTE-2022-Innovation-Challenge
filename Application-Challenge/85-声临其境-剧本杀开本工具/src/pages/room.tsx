class RoomJoin extends React.Component {
    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.state = {
            value: null,
        };
    }


    render() {
        return (
            <button className="square" onClick={ () => {
                console.log('click');
                this.setState({value:".state"});
            }}>
                {this.state.value}
            </button>
        );
    }
}