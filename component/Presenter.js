import { useState, useMemo, useCallback, useEffect } from 'react'
import { Navigation, EffectFade } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import "swiper/css/effect-fade";

export default function Presenter ({ items }) {
  const [speech, setSpeech] = useState()
  const [swiper, setSwiper] = useState()
  
  const getVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === 'Karen') ||
      voices.find(v => v.name === 'Alex') ||
      voices.find(v => v.name === 'Fiona') ||
      voices[0]
    return voice
  }

  useEffect(() => {
    if (!window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance();
    utter.volume = 1; // From 0 to 1
    utter.rate = .875; // From 0.1 to 10
    utter.pitch = 1.7; // From 0 to 2
    utter.lang = 'en-US';
    // utter.text = "Hello World. My bname is aa";
    // speechSynthesis.speak(msg);
    const speech = {
      utter,
      speak(msg, cancelPrevious = true) {
        utter.voice = getVoice()
        console.log(utter.voice)
        if (cancelPrevious) {
          speechSynthesis.cancel()
        }
        utter.text = msg
        speechSynthesis.speak(utter)
      }
    }
    setSpeech(speech)
  }, [])

  const play = useCallback((swiper, index = 0) => {
    const item = items[index]
    console.log('play', items, index, item)
    if (speech) {
      speech.utter.onend = () => {
        console.log('Speech has finished', index);
        if (index + 1 < items.length) {
          setTimeout(() => swiper.slideTo(index + 1), 300)
        }
      }
      speech.speak(item.text)
    } else {
      setTimeout(() => {
        swiper.slideTo(index + 1)
      }, 10000)
    }
  }, [speech, items])

  // useEffect(() => {
  //   if (!items || !speech || !swiper) return
  //   speech.utter.onend = () => {
  //     console.log('Speech has finished');
  //   }
  // }, [items, speech, swiper])

  return (
    <>
      {items && items.length ? (
        <Swiper
          modules={[EffectFade, Navigation]}
          navigation={false}
          effect={"fade"}
          className="mySwiper"
          onInit={swiper => setSwiper(swiper)}
          onClick={swiper => swiper.activeIndex === 0 && play(swiper, swiper.activeIndex)}
          onSlideChange={swiper => console.log('onSlideChange', swiper.previousIndex, '->', swiper.activeIndex) || play(swiper, swiper.activeIndex)}
        >
          {items.map(item => (
            <SwiperSlide key={item.text}>
              <span className='details'>{item.text}</span>
              <img src={item.image} />
            </SwiperSlide>
          ))}
          {/* <span slot="container-start">Container Start</span>
          <span slot="container-end">Container End</span>
          <span slot="wrapper-start">Wrapper Start</span>
          <span slot="wrapper-end">Wrapper End</span> */}
        </Swiper>
      ) : null}
    </>
  )
}
