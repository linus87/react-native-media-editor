/* @flow */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  Dimensions,
  Platform,
  ActivityIndicator,
  TextInput
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import RNMediaEditor from 'react-native-media-editor';
import Video from 'react-native-video';


var options = {
  photo: {
    title: 'Select Image',
    mediaType: 'photo',
    storageOptions: {
      skipBackup: true,
    }
  },
  video: {
    title: 'Select Video',
    mediaType: 'video',
    storageOptions: {
      skipBackup: true,
    }
  }
};

function toVerticalString(str) {
  let verStr = '';
  for (s of str) {
    verStr += s + '\n';
  }
  return verStr;
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      assetType: 'image',
      asset: null,
      text: 'Hello world',
      fontSize: 20,
      colorCode: '#ffffff',
      textBackgroundColor: '#ff00e0'
    };

    this.onButtonPress = this.onButtonPress.bind(this);
    this.onEmbedButtonPress = this.onEmbedButtonPress.bind(this);
    this.renderMedia = this.renderMedia.bind(this);
    this.renderVideo = this.renderVideo.bind(this);
    this.renderImage = this.renderImage.bind(this);
    this.renderInput = this.renderInput.bind(this);
    this.log = this.log.bind(this);
  }

  log() {
    console.log(this.state);

  }

  onButtonPress(type) {
    this.setState({
      assetType: type,
      asset: null,
      loading: true
    });

    ImagePicker.launchImageLibrary(options[type], (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        console.log(response);
        // You can display the image using either data...
        let source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

        // or a reference to the platform specific asset location
        if (Platform.OS === 'ios') {
          source = {
            ...source,
            path: response.uri.replace('file://', ''),
            assetURL: response.origURL,
            width: response.width,
            height: response.height,
          };
        } else {
          source = {
            path: response.path,
            width: response.width,
            height: response.height,
          };
        }

        this.setState({
          asset: source,
          loading: false,
        });
      }
    });
  }

  onEmbedButtonPress() {
    const {asset, assetType, text, subText, fontSize, colorCode, textBackgroundColor} = this.state;
    const data = asset.uri.replace('data:image/jpeg;base64,', '');
    const options = {
      data,
      type: assetType,
      path: asset.path,
      left: 200,
      top: 200,
      backgroundOpacity: 0.5,
      text,
      fontSize,
      textColor: colorCode,
      backgroundColor: textBackgroundColor
    };
    RNMediaEditor.embedText(options)
      .then(res => {
        const data = 'data:image/jpeg;base64,' + res[1];
        this.setState({
          asset: {...this.state.asset, uri: data}
        })
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });



    // if (assetType === 'video') {
    //   RNMediaEditor.embedTextOnVideo(text, asset.path, fontSize);
    // } else if (assetType === 'image') {
    //   RNMediaEditor.embedTextOnImage(
    //     text, asset.path, fontSize,
    //     colorCode, textBackgroundColor,
    //     0.5, 200, 200,
    //     (message, path) => {
    //       console.log('success with response:', message, path);
    //     },
    //     (err) => {
    //       console.error('error with response:', err);
    //     }
    //   );
    // }
  }

  renderMedia() {
    const { assetType } = this.state;
    if (assetType === 'video') {
      return this.renderVideo();
    } else if (assetType === 'image') {
      return this.renderImage();
    } else {
      return;
    }
  }

  renderVideo() {
    if (this.state.asset) {
      return (
        <Video
          source={{uri: this.state.asset.path}}
          ref={ref => {
            this.player = ref;
          }}
          resizeMode="cover"
          repeat
          rate={1.0}
          style={styles.video}
        />
      );
    } else {
      return <ActivityIndicator />;
    }
  }

  renderImage() {
    if (this.state.assetType === 'image') {
      return (
        <Image
          style={styles.image}
          source={this.state.asset}
          resizeMode={'contain'}
        />
      )
    } else if (this.state.loading) {
      return <ActivityIndicator />;
    } else {
      return;
    }
  }

  renderInput() {
    return (
      <View>
        <View>
          <Text style={styles.labelText}>Text</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => this.setState({text})}
            value={this.state.text}
          />
        </View>
        <View>
          <Text>Font Size</Text>
          <TextInput
            style={styles.input}
            onChangeText={(fontSize) => this.setState({fontSize: Number(fontSize)})}
            keyboardType="number-pad"
            value={String(this.state.fontSize)}
          />
        </View>
        <View>
          <Text>Color</Text>
          <TextInput
            style={styles.input}
            onChangeText={(colorCode) => this.setState({colorCode})}
            value={this.state.colorCode}
          />
        </View>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
        { this.renderMedia() }
      </View>
      <View style={styles.container}>
        <Button
          onPress={() => { this.onButtonPress('image') }}
          title="Pick Image"
        />
        <Button
          onPress={() => { this.onButtonPress('video') }}
          title="Pick Video"
        />
        <Button
          onPress={this.onEmbedButtonPress}
          title="Embed Text"
        />
        <Button
          onPress={this.log}
          title="Log"
        />
          { this.renderInput() }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height/2,
  },
  input: {
    height: 20,
    width: 200,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    borderRadius: 5,
    fontSize: 14,
    padding: 4,
  },
  video: {
    flex: 1,
    width: 200,
    height: 300
  }
});

export default App;
