import Head from "next/head";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { chunk } from 'lodash'
import { Button, Form, Spinner } from 'react-bootstrap';
import styles from "../styles/Home.module.css";
import Presenter from '../component/Presenter'

function wait(t) {
  return new Promise(r => setTimeout(r, t))
}

export default function Home() {
  // const [token, setToken] = useState("");
  // const [query, setQuery] = useState("");
  const [progress, setProgress] = useState(2);
  const [totalProgress, setTotalProgress] = useState(10);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [character, setCharacter] = useState('blue pig')
  const [introText, setIntroText] = useState('walking in the street to Draper University')
  const [type, setType] = useState("webp");

  const currentProgress = useMemo(() => {
    const p = +(100 * progress / totalProgress).toFixed(0)
    return `${p > 100 ? 100 : p}%`
  }, [progress, totalProgress])

  async function generateScenes() {
    try {
      if (character.trim() === '' || introText.trim() === '') {
        setError(true);
        return
      }
      setError(false);
      setLoading(true);
      let progress = 2
      setProgress(progress)

      const story = localStorage.getItem('story')
      if (story) {
        await wait(1000)
        setResults(JSON.parse(story))
      } else {
        const res = await axios.post(`/api/novel?character=${character.trim()}&intro=${introText.trim()}`)
        const result = res.data.result
        console.log('result', result)
        progress += result.drawTexts.length
        setProgress(progress)
  
        const items = []
        const chunkKeys = chunk(
          [...Array(result.drawTexts.length).keys()],
          2,
        )
        for (const keys of chunkKeys) {
          const chunkItems = await Promise.all(
            keys.map(async i => {
              const item = {
                text: result.texts[i],
                drawText: result.drawTexts[i],
                image: null,
              }
              const fetchImage = async () => {
                item.image = await getDalle2(item.drawText)
              }
              for (let j = 0; j < 3; j++) {
                try {
                  await fetchImage()
                  break
                } catch (er) {
                  console.error(er)
                }
              }
              
              console.log('item:', i, item)
              setProgress(++progress)
              return item
            })
          )
          items.push(...chunkItems)
        }
        setResults(items)
        console.log('items:', items)
      }
      setLoading(false);
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100)
    } catch (err) {
      console.error(err)
      setLoading(false);
      setError(true);
    }
  }

  async function getDalle2(query) {
    try {
      setError(false);
      // setLoading(true);
      // .post(`/api/dalle2?k=${token}&q=${query}`)
      const res = await axios.post(`/api/dalle2?q=${query}`)
      const result = res.data.result
      console.log('DALLE result', result)
      const image = result[0].generation.image_path
      // setLoading(false);
      return image
    } catch (err) {
      console.error(err)
      // setLoading(false);
      setError(true);
    }
  }

  function download(url) {
    axios
      .post(`/api/download`, { url: url, type: type })
      .then((res) => {
        const link = document.createElement("a");
        link.href = res.data.result;
        link.download = `${character}.${type.toLowerCase()}`;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Kiddos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          KIDDOS <span className={styles.titleColor}>Bedtime Story</span>
        </h1>
        <br />
        <br />
        <Form>
          <Form.Group className="mb-3" controlId="character">
            <Form.Label>Character</Form.Label>
            <Form.Control
              type="text"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              placeholder="Character. ex. pink pikachu"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="introtext">
            <Form.Label>Introduction</Form.Label>
            <Form.Control
              type="text"
              as="textarea"
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              placeholder="Introduction. ex. running through the space"
            />
          </Form.Group>
          <Button type="button" variant="primary" onClick={generateScenes} disabled={loading}>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              style={{marginRight: '0.5em'}}
              className={loading ? '' : 'visually-hidden'}
            />
            Create Story
            { loading ? (
              <>&nbsp;({currentProgress})</>
            ) : null }
          </Button>
        </Form>

        {error ? ( <div className={styles.error}>Something went wrong. Try again.</div> ) : ( <></> )}
        {results.length ? (
        <>
          <div className="presenter-padder fade-in" />
          <div className="presenter-wrapper fade-in">
            <Presenter items={results} />
          </div>
        </>
        ) : null}
        {/* <p className={styles.description}>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Bearer Token"
          />
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Query"
          />
          {"  "}
          <button onClick={getDalle2}>Get 4 Images</button>
        </p> */}
        {/* <small>
          Download as:{" "}
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="webp">Webp</option>
            <option value="png">Png</option>
            <option value="jpg">Jpg</option>
            <option value="gif">Gif</option>
            <option value="avif">Avif</option>
          </select>
          {" "}
          Click the image below and save.
        </small> */}
        {/* <div className={styles.grid}>
          {results.map((result) => {
            return (
              <div className={styles.card}>
                <img
                  className={styles.imgPreview}
                  src={result.image}
                  onClick={() => download(result.image)}
                />
                <p>{result.text}</p>
              </div>
            );
          })}
        </div> */}
      </main>
    </div>
  );
}
