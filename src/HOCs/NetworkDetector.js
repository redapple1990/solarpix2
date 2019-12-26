/*
https://www.codementor.io/nedson/a-guide-to-handling-internet-disconnection-in-react-applications-rs7u9zpwn
This component Code from this site
*/

import React, { Component } from 'react';

//let isDisconnectedVar = false;

export default function (ComposedComponent) {
  class NetworkDetector extends Component {
    state = {
      isDisconnected: false
    }

    componentDidMount() {
      this.handleConnectionChange();
      window.addEventListener('online', this.handleConnectionChange);
      window.addEventListener('offline', this.handleConnectionChange);
    }

    componentWillUnmount() {
      window.removeEventListener('online', this.handleConnectionChange);
      window.removeEventListener('offline', this.handleConnectionChange);
    }


    handleConnectionChange = async () => {
      const condition = navigator.onLine ? 'online' : 'offline';
      if (condition === 'online') {
        const webPing = setInterval(
          () => {
            fetch('//google.com', {
              mode: 'no-cors',
              })
            .then(() => {
              this.setState({ isDisconnected: false }
                , () => {
                return clearInterval(webPing)
              });
            }).catch(() => this.setState({ isDisconnected: true }) )
          }, 2000);
        return;
      }

      return this.setState({ isDisconnected: true });
    }

    render() {
      //return <ComposedComponent {...this.props}  isDisconnected={this.state.isDisconnected} />;

      const { isDisconnected } = this.state;
      return (
        <div>
          { isDisconnected && (<div className='ui block center aligned header' style={{ backgroundColor: 'orange' }}>
              <p>Offline Mode</p>
            </div>)
          }
          <ComposedComponent {...this.props} isDisconnected={this.state.isDisconnected}/>
        </div>
      );

    }
  }

  return NetworkDetector;
}
