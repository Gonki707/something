import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>Општина Маврово и Ростуше</h4>
          <p>Општина сместена во северо-западниот дел на Република Северна Македонија, во прегратките на Националниот парк Маврово.</p>
          <p>Маврови Анови, ул. „Маврово“ бб<br />Тел: +389 (0) 42 488 660<br />Е-маил: info@mavrovo.gov.mk</p>
        </div>
        <div>
          <h4>Општина</h4>
          <Link to="/mestopolozba">Местоположба</Link><br />
          <Link to="/naseleni-mesta">Населени места</Link><br />
          <Link to="/gradonacalnik">Градоначалник</Link><br />
          <Link to="/sovet-na-opstinata">Совет на општината</Link>
        </div>
        <div>
          <h4>Информации</h4>
          <Link to="/objavi/Новости">Новости</Link><br />
          <Link to="/objavi/Соопштенија">Соопштенија</Link><br />
          <Link to="/sluzben-glasnik">Службен гласник</Link><br />
          <Link to="/proekti">Проекти</Link>
        </div>
        <div>
          <h4>Граѓани</h4>
          <Link to="/prijavi-problem">Пријави проблем</Link><br />
          <Link to="/danoci">Даноци</Link><br />
          <Link to="/uplatnici">Примери уплатници</Link><br />
          <Link to="/admin">Админ панел</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} Општина Маврово и Ростуше. Сите права задржани.
      </div>
    </footer>
  );
}
