import React, { useEffect, useState } from "react";
import { graphql } from "gatsby";
import Img from "gatsby-image";
import Moment from "react-moment";
import Layout from "../components/layout";
import Markdown from "react-markdown";

export const query = graphql`
  query ArticleQuery($slug: String!) {
    strapiArticle(slug: { eq: $slug }, status: { eq: "published" }) {
      strapiId
      title
      description
      content
      publishedAt
      image {
        publicURL
        childImageSharp {
          fixed {
            src
          }
        }
      }
      author {
        name
        picture {
          childImageSharp {
            fixed(width: 30, height: 30) {
              src
            }
          }
        }
      }
    }
  }
`;


const Article = ({ data }) => {
  const article = data.strapiArticle;
  const seo = {
    metaTitle: article.title,
    metaDescription: article.description,
    shareImage: article.image,
    article: true,
  };

const [commentaires, setCommentaires] = useState([]) // hook: getter/setter des commentaires dans un array

const fetchCommentaires = () => {
  fetch("https://blog-picone.herokuapp.com/commentaires?article="+article.strapiId)
  //récupérer à tel endroit les commentaires de tel articles
  .then(reponse => reponse.json())
  //transformer la reponse en .json
  .then(comms => {
    const commentairesAAfficher = comms.map(comm => {
      const date = new Date(comm.published_at).toLocaleString("fr")
      //mettre la date au format string et fr
      return ( //retourner les comms sous forme de div
      <div className="commentaire"> 
        <div className="nom">{comm.nom}</div>
        <div className="texte">{comm.texte}</div>
        <div className="date">{date}</div>
      </div>
      )
    })
    setCommentaires(commentairesAAfficher)
  })
}

const soumettre = evenement => {
  evenement.preventDefault() // empêcher l'action par défaut (ici recharger la page immédiatement)
  const nom = evenement.target.nom.value
  const texte = evenement.target.texte.value
 
  const comment = { // déclarer à de quoi est constitué 1 commentaire
    nom,
    texte,
    article: article.strapiId,
  }

  fetch("https://blog-picone.herokuapp.com/commentaires", {
    // récupérer le commentaire qui est sous forme json et le transformer en string
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(comment),
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      fetchCommentaires();
    }).catch(err=>console.error)
}

useEffect(fetchCommentaires, [article]) // ne se lance qu'une fois et se rafraîchit que lorsqu'il y a des nouveaux commentaires


  return (
    <Layout seo={seo}>
      <div>
        <div
          id="banner"
          className="uk-height-medium uk-flex uk-flex-center uk-flex-middle uk-background-cover uk-light uk-padding uk-margin"
          data-src={article.image.publicURL}
          data-srcset={article.image.publicURL}
          data-uk-img
        >
          <h1>{article.title}</h1>
        </div>

        <div className="uk-section">
          <div className="uk-container uk-container-small">
            <Markdown source={article.content} escapeHtml={false} />

            <hr className="uk-divider-small" />

            <div className="uk-grid-small uk-flex-left" data-uk-grid="true">
              <div>
                {article.author.picture && (
                  <Img
                    fixed={article.author.picture.childImageSharp.fixed}
                    imgStyle={{ position: "static", borderRadius: "50%" }}
                  />
                )}
              </div>
              <div className="uk-width-expand">
                <p className="uk-margin-remove-bottom">
                  By {article.author.name}
                </p>
                <p className="uk-text-meta uk-margin-remove-top">
                  <Moment format="MMM Do YYYY">{article.published_at}</Moment>
                </p>
              </div>
            </div>
          </div>
         {/* mise en place du formulaire de soumission des commentaires*/}
         <div className="cadreForm">
         <div className="Formulaire">
          <form onSubmit={soumettre}>
            <input type="text" name="nom" placeholder="Votre nom" required
       minlength="4" maxlength="20" />
            <input type="text" name="texte" placeholder="Votre commentaire" />
            <button type="submit">Envoyer</button>
          </form>
          </div>
         </div>
          <div className = "commentaires">{commentaires}</div>
        </div>
      </div>
    </Layout>
  );
};

export default Article;