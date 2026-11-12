#!/usr/bin/env python3
"""Source of truth for UI strings. Generates extension/_locales/<lang>/messages.json.

Run:  python3 scripts/build-locales.py
Placeholders use {name} and are passed in order as substitutions to chrome.i18n.getMessage.
Strings ending in _html contain trusted markup and are set with innerHTML.
"""
import json, os, re

LANGS = ["en", "es", "pt_BR", "de", "fr", "ja"]

# key: (en, es, pt_BR, de, fr, ja)
S = {
"extName": ("Image Number Helper – Number & Label Images on Any Page", "Image Number Helper – Numera las imágenes de cualquier página", "Image Number Helper – Numere as imagens de qualquer página", "Image Number Helper – Bilder auf jeder Seite nummerieren", "Image Number Helper – Numérotez les images de toute page", "Image Number Helper – ページ上の画像に番号を付ける"),
"extShortName": ("Image Numbers", "Image Numbers", "Image Numbers", "Image Numbers", "Image Numbers", "Image Numbers"),
"extDesc": (
 "Number every image on a page so reviews, QA and meetings can say “image 7” instead of “the one on the left.”",
 "Numera cada imagen de la página para que en revisiones, QA y reuniones digas «imagen 7» en lugar de «la de la izquierda».",
 "Numere cada imagem da página para que revisões, QA e reuniões digam “imagem 7” em vez de “aquela da esquerda”.",
 "Nummeriert jedes Bild auf einer Seite – damit in Reviews, QA und Meetings „Bild 7“ statt „das links“ gesagt wird.",
 "Numérote chaque image d’une page : en revue, en QA et en réunion, dites « image 7 » au lieu de « celle de gauche ».",
 "ページ上のすべての画像に番号を付けて、レビューや QA、会議で「左のあれ」ではなく「画像 7」と言えるようにします。"),
"cmdToggle": ("Show / hide image numbers on this page", "Mostrar u ocultar los números en esta página", "Mostrar ou ocultar os números nesta página", "Bildnummern auf dieser Seite ein-/ausblenden", "Afficher / masquer les numéros sur cette page", "このページの画像番号を表示 / 非表示"),
"actionTitle": ("Image Number Helper (Alt+Shift+N)",)*6,
"menuCopyNumber": ("Copy image number", "Copiar número de imagen", "Copiar número da imagem", "Bildnummer kopieren", "Copier le numéro de l’image", "画像番号をコピー"),
"menuToggle": ("Show / hide image numbers", "Mostrar u ocultar números", "Mostrar ou ocultar números", "Bildnummern ein-/ausblenden", "Afficher / masquer les numéros", "画像番号を表示 / 非表示"),
"refImage": ("Image {n}", "Imagen {n}", "Imagem {n}", "Bild {n}", "Image {n}", "画像 {n}"),
"copied": ("Copied", "Copiado", "Copiado", "Kopiert", "Copié", "コピーしました"),
"moreImages_html": ("+{count} more images · <b>Unlock Pro</b>", "+{count} imágenes más · <b>Desbloquear Pro</b>", "+{count} imagens a mais · <b>Desbloquear Pro</b>", "+{count} weitere Bilder · <b>Pro freischalten</b>", "+{count} autres images · <b>Débloquer Pro</b>", "あと {count} 枚 · <b>Pro を解除</b>"),
"errInvalidKey": ("That key isn’t valid. Copy the whole key from your receipt page or email.", "Esa clave no es válida. Copia la clave completa de la página de recibo o del correo.", "Essa chave não é válida. Copie a chave inteira da página do recibo ou do e-mail.", "Dieser Schlüssel ist ungültig. Kopiere den vollständigen Schlüssel aus der Bestätigungsseite oder E-Mail.", "Cette clé n’est pas valide. Copiez la clé complète depuis la page de reçu ou l’e-mail.", "このキーは無効です。領収ページまたはメールからキー全体をコピーしてください。"),
"planFree": ("Free", "Gratis", "Grátis", "Free", "Gratuit", "無料"),
"planPro": ("Pro",)*6,
"toggleTitle": ("Show / hide numbers (Alt+Shift+N)", "Mostrar u ocultar números (Alt+Shift+N)", "Mostrar ou ocultar números (Alt+Shift+N)", "Nummern ein-/ausblenden (Alt+Shift+N)", "Afficher / masquer les numéros (Alt+Shift+N)", "番号の表示 / 非表示 (Alt+Shift+N)"),
"showNumbers": ("Show numbers", "Mostrar números", "Mostrar números", "Nummern anzeigen", "Afficher les numéros", "番号を表示"),
"imagesNumberedOne": ("image numbered", "imagen numerada", "imagem numerada", "Bild nummeriert", "image numérotée", "枚に番号付け"),
"imagesNumberedMany": ("images numbered", "imágenes numeradas", "imagens numeradas", "Bilder nummeriert", "images numérotées", "枚に番号付け"),
"numbersOff": ("numbers are off", "números desactivados", "números desativados", "Nummern sind aus", "numéros désactivés", "番号はオフです"),
"onHost": ("on {host}", "en {host}", "em {host}", "auf {host}", "sur {host}", "{host} 上"),
"offHint": ("{count} images on {host} · press the switch", "{count} imágenes en {host} · activa el interruptor", "{count} imagens em {host} · ative o botão", "{count} Bilder auf {host} · Schalter umlegen", "{count} images sur {host} · activez l’interrupteur", "{host} に画像 {count} 枚 · スイッチをオン"),
"meterCta": ("Showing {shown} of {total} — number all {total} with Pro →", "Mostrando {shown} de {total} — numera las {total} con Pro →", "Mostrando {shown} de {total} — numere todas as {total} com o Pro →", "{shown} von {total} sichtbar – alle {total} mit Pro →", "{shown} sur {total} affichées — numérotez les {total} avec Pro →", "{total} 枚中 {shown} 枚を表示 — Pro で全 {total} 枚に →"),
"unsupportedTitle": ("Open a regular web page", "Abre una página web normal", "Abra uma página da web comum", "Öffne eine normale Webseite", "Ouvrez une page web classique", "通常のウェブページを開いてください"),
"unsupportedBody": ("Chrome doesn’t let extensions draw on browser pages or the Web Store. Try any http or https site.", "Chrome no permite que las extensiones dibujen en páginas del navegador ni en la Web Store. Prueba cualquier sitio http o https.", "O Chrome não permite que extensões desenhem em páginas do navegador nem na Web Store. Tente qualquer site http ou https.", "Chrome erlaubt Erweiterungen nicht, auf Browserseiten oder im Web Store zu zeichnen. Probiere eine beliebige http- oder https-Seite.", "Chrome n’autorise pas les extensions sur les pages du navigateur ni sur le Web Store. Essayez n’importe quel site http ou https.", "Chrome では、ブラウザのページや Web Store に拡張機能は描画できません。http / https のサイトでお試しください。"),
"goToImage": ("Go to image", "Ir a la imagen", "Ir para a imagem", "Zu Bild springen", "Aller à l’image", "画像へ移動"),
"show": ("Show", "Ver", "Ver", "Zeigen", "Voir", "表示"),
"copyReport": ("Copy report", "Copiar informe", "Copiar relatório", "Bericht kopieren", "Copier le rapport", "レポートをコピー"),
"screenshot": ("Screenshot", "Captura", "Captura", "Screenshot", "Capture", "スクリーンショット"),
"renumber": ("Renumber", "Renumerar", "Renumerar", "Neu nummerieren", "Renuméroter", "振り直し"),
"alwaysOn_html": ("Always number images on <b>{host}</b>", "Numerar siempre las imágenes en <b>{host}</b>", "Sempre numerar imagens em <b>{host}</b>", "Bilder auf <b>{host}</b> immer nummerieren", "Toujours numéroter les images sur <b>{host}</b>", "<b>{host}</b> では常に番号を付ける"),
"appearance": ("Appearance & options", "Apariencia y opciones", "Aparência e opções", "Darstellung & Optionen", "Apparence et options", "表示とオプション"),
"color": ("Color", "Color", "Cor", "Farbe", "Couleur", "色"),
"position": ("Position", "Posición", "Posição", "Position", "Position", "位置"),
"size": ("Size", "Tamaño", "Tamanho", "Größe", "Taille", "サイズ"),
"skipSmaller": ("Skip images smaller than", "Omitir imágenes menores de", "Ignorar imagens menores que", "Bilder kleiner als … überspringen", "Ignorer les images de moins de", "これより小さい画像を除外"),
"startAt": ("Start numbering at", "Empezar a numerar en", "Começar a numerar em", "Nummerierung beginnt bei", "Commencer la numérotation à", "開始番号"),
"reportFormat": ("Report format", "Formato del informe", "Formato do relatório", "Berichtsformat", "Format du rapport", "レポート形式"),
"fmtMarkdown": ("Markdown table", "Tabla Markdown", "Tabela Markdown", "Markdown-Tabelle", "Tableau Markdown", "Markdown 表"),
"fmtText": ("Plain text", "Texto sin formato", "Texto simples", "Nur Text", "Texte brut", "プレーンテキスト"),
"fmtCsv": ("CSV (spreadsheet)", "CSV (hoja de cálculo)", "CSV (planilha)", "CSV (Tabelle)", "CSV (tableur)", "CSV（表計算）"),
"colorRed": ("Red", "Rojo", "Vermelho", "Rot", "Rouge", "赤"),
"colorBlue": ("Blue", "Azul", "Azul", "Blau", "Bleu", "青"),
"colorBlack": ("Black", "Negro", "Preto", "Schwarz", "Noir", "黒"),
"colorYellow": ("Yellow", "Amarillo", "Amarelo", "Gelb", "Jaune", "黄"),
"colorGreen": ("Green", "Verde", "Verde", "Grün", "Vert", "緑"),
"colorPurple": ("Purple", "Morado", "Roxo", "Lila", "Violet", "紫"),
"posTL": ("Top left", "Arriba a la izquierda", "Superior esquerdo", "Oben links", "En haut à gauche", "左上"),
"posTR": ("Top right", "Arriba a la derecha", "Superior direito", "Oben rechts", "En haut à droite", "右上"),
"posC": ("Center", "Centro", "Centro", "Mitte", "Centre", "中央"),
"posBL": ("Bottom left", "Abajo a la izquierda", "Inferior esquerdo", "Unten links", "En bas à gauche", "左下"),
"posBR": ("Bottom right", "Abajo a la derecha", "Inferior direito", "Unten rechts", "En bas à droite", "右下"),
"shortcut": ("Shortcut", "Atajo", "Atalho", "Kürzel", "Raccourci", "ショートカット"),
"upgradeCta": ("Upgrade · {price}", "Mejorar · {price}", "Fazer upgrade · {price}", "Upgrade · {price}", "Passer à Pro · {price}", "アップグレード · {price}"),
"proCheck": ("Pro ✓",)*6,
"back": ("Back", "Atrás", "Voltar", "Zurück", "Retour", "戻る"),
"buyHeadline_html": ("Number every image.<br>Pay once, keep it forever.", "Numera todas las imágenes.<br>Paga una vez y es tuyo para siempre.", "Numere todas as imagens.<br>Pague uma vez, use para sempre.", "Jedes Bild nummerieren.<br>Einmal zahlen, für immer behalten.", "Numérotez toutes les images.<br>Payez une fois, gardez-le pour toujours.", "すべての画像に番号を。<br>買い切りでずっと使えます。"),
"featureLocked_html": ("{feature} is a Pro feature.<br>Pay once, keep it forever.", "{feature} es una función Pro.<br>Paga una vez y es tuya para siempre.", "{feature} é um recurso Pro.<br>Pague uma vez, use para sempre.", "{feature} ist eine Pro-Funktion.<br>Einmal zahlen, für immer behalten.", "{feature} est une fonction Pro.<br>Payez une fois, gardez-la pour toujours.", "{feature}は Pro 機能です。<br>買い切りでずっと使えます。"),
"featReport": ("The meeting report", "El informe de reunión", "O relatório de reunião", "Der Meeting-Bericht", "Le rapport de réunion", "会議用レポート"),
"featScreens": ("Numbered screenshots", "La captura numerada", "A captura numerada", "Der nummerierte Screenshot", "La capture numérotée", "番号付きスクリーンショット"),
"featColors": ("Extra colors", "Más colores", "Mais cores", "Weitere Farben", "Plus de couleurs", "追加カラー"),
"featPosition": ("Badge position", "La posición del número", "A posição do número", "Die Badge-Position", "La position du badge", "番号の位置"),
"featStart": ("Custom start number", "El número inicial", "O número inicial", "Eigene Startnummer", "Le numéro de départ", "開始番号の変更"),
"perk1_html": ("<b>Unlimited numbers</b> — not just the first 8", "<b>Números ilimitados</b>, no solo las 8 primeras", "<b>Números ilimitados</b>, não só as 8 primeiras", "<b>Unbegrenzt nummerieren</b> – nicht nur die ersten 8", "<b>Numéros illimités</b>, pas seulement les 8 premières", "<b>番号付けは無制限</b>（最初の 8 枚だけではありません）"),
"perk2_html": ("<b>Meeting report</b> — alt text, sizes &amp; files as Markdown, text or CSV", "<b>Informe de reunión</b>: texto alternativo, tamaños y archivos en Markdown, texto o CSV", "<b>Relatório de reunião</b>: texto alternativo, tamanhos e arquivos em Markdown, texto ou CSV", "<b>Meeting-Bericht</b> – Alt-Text, Größen &amp; Dateien als Markdown, Text oder CSV", "<b>Rapport de réunion</b> : texte alternatif, tailles et fichiers en Markdown, texte ou CSV", "<b>会議用レポート</b>：代替テキスト・サイズ・ファイル名を Markdown / テキスト / CSV で"),
"perk3_html": ("<b>Numbered screenshots</b> — one click, ready for Slack or Jira", "<b>Capturas numeradas</b> con un clic, listas para Slack o Jira", "<b>Capturas numeradas</b> com um clique, prontas para Slack ou Jira", "<b>Nummerierte Screenshots</b> – ein Klick, bereit für Slack oder Jira", "<b>Captures numérotées</b> en un clic, prêtes pour Slack ou Jira", "<b>番号付きスクリーンショット</b>をワンクリックで（Slack や Jira にそのまま）"),
"perk4_html": ("<b>6 colors, 5 positions</b>, custom start number", "<b>6 colores, 5 posiciones</b> y número inicial a tu gusto", "<b>6 cores, 5 posições</b> e número inicial personalizado", "<b>6 Farben, 5 Positionen</b>, eigene Startnummer", "<b>6 couleurs, 5 positions</b>, numéro de départ au choix", "<b>6 色・5 か所の位置</b>、開始番号も自由に"),
"perk5_html": ("<b>Every future Pro feature</b>, on all your Chrome profiles", "<b>Todas las futuras funciones Pro</b>, en todos tus perfiles de Chrome", "<b>Todos os futuros recursos Pro</b>, em todos os seus perfis do Chrome", "<b>Alle künftigen Pro-Funktionen</b>, in allen Chrome-Profilen", "<b>Toutes les futures fonctions Pro</b>, sur tous vos profils Chrome", "<b>今後の Pro 機能もすべて</b>、すべての Chrome プロフィールで"),
"getPro": ("Get Pro — {price} once", "Obtener Pro: {price}, pago único", "Obter o Pro: {price}, pagamento único", "Pro holen – einmalig {price}", "Obtenir Pro — {price}, une fois", "Pro を入手 — {price}（買い切り）"),
"fine": ("Secure checkout by Stripe · Cards, Apple Pay, Google Pay · 30-day refund", "Pago seguro con Stripe · Tarjeta, Apple Pay, Google Pay · Reembolso en 30 días", "Pagamento seguro pela Stripe · Cartão, Apple Pay, Google Pay · Reembolso em 30 dias", "Sichere Zahlung über Stripe · Karte, Apple Pay, Google Pay · 30 Tage Geld zurück", "Paiement sécurisé par Stripe · Carte, Apple Pay, Google Pay · Remboursement sous 30 jours", "Stripe による安全な決済 · カード / Apple Pay / Google Pay · 30 日間返金保証"),
"haveKey": ("Already bought? Paste your license key", "¿Ya lo compraste? Pega tu clave de licencia", "Já comprou? Cole sua chave de licença", "Schon gekauft? Lizenzschlüssel einfügen", "Déjà acheté ? Collez votre clé de licence", "購入済みの方はライセンスキーを貼り付け"),
"activate": ("Activate", "Activar", "Ativar", "Aktivieren", "Activer", "有効化"),
"lostKey": ("Lost your key?", "¿Perdiste tu clave?", "Perdeu sua chave?", "Schlüssel verloren?", "Clé perdue ?", "キーを紛失した場合"),
"checking": ("Checking…", "Comprobando…", "Verificando…", "Wird geprüft …", "Vérification…", "確認中…"),
"unlocked": ("Pro unlocked. Enjoy!", "Pro desbloqueado. ¡Disfrútalo!", "Pro desbloqueado. Aproveite!", "Pro freigeschaltet. Viel Spaß!", "Pro débloqué. Profitez-en !", "Pro が有効になりました！"),
"somethingWrong": ("Something went wrong.", "Algo salió mal.", "Algo deu errado.", "Etwas ist schiefgelaufen.", "Une erreur s’est produite.", "問題が発生しました。"),
"youArePro": ("You’re Pro", "Ya eres Pro", "Você é Pro", "Du hast Pro", "Vous êtes Pro", "Pro をご利用中です"),
"licensedTo_html": ("Licensed to <b>{email}</b>. Thanks for supporting an indie tool!", "Licencia a nombre de <b>{email}</b>. ¡Gracias por apoyar una herramienta independiente!", "Licenciado para <b>{email}</b>. Obrigado por apoiar uma ferramenta independente!", "Lizenziert für <b>{email}</b>. Danke, dass du ein Indie-Tool unterstützt!", "Licence au nom de <b>{email}</b>. Merci de soutenir un outil indépendant !", "<b>{email}</b> にライセンス済み。個人開発ツールへのご支援ありがとうございます！"),
"thisBrowser": ("this browser", "este navegador", "este navegador", "diesen Browser", "ce navigateur", "このブラウザ"),
"removeLicense": ("Remove license from this browser", "Quitar la licencia de este navegador", "Remover a licença deste navegador", "Lizenz aus diesem Browser entfernen", "Retirer la licence de ce navigateur", "このブラウザからライセンスを削除"),
"noImage": ("No image #{n} on this page", "No hay imagen n.º {n} en esta página", "Não há imagem nº {n} nesta página", "Kein Bild Nr. {n} auf dieser Seite", "Pas d’image n° {n} sur cette page", "このページに画像 {n} はありません"),
"reportCopied": ("Report for {count} images copied", "Informe de {count} imágenes copiado", "Relatório de {count} imagens copiado", "Bericht für {count} Bilder kopiert", "Rapport de {count} images copié", "{count} 枚分のレポートをコピーしました"),
"clipboardFail": ("Couldn’t reach the clipboard", "No se pudo acceder al portapapeles", "Não foi possível acessar a área de transferência", "Kein Zugriff auf die Zwischenablage", "Impossible d’accéder au presse-papiers", "クリップボードにアクセスできません"),
"turnOnFirst": ("Turn numbers on first", "Activa los números primero", "Ative os números primeiro", "Schalte zuerst die Nummern ein", "Activez d’abord les numéros", "先に番号をオンにしてください"),
"shotSaved": ("Screenshot copied & saved", "Captura copiada y guardada", "Captura copiada e salva", "Screenshot kopiert & gespeichert", "Capture copiée et enregistrée", "スクリーンショットをコピー＆保存しました"),
"shotBlocked": ("Chrome blocked the capture on this page", "Chrome bloqueó la captura en esta página", "O Chrome bloqueou a captura nesta página", "Chrome hat die Aufnahme auf dieser Seite blockiert", "Chrome a bloqué la capture sur cette page", "このページでは Chrome がキャプチャをブロックしました"),
"renumbered": ("Renumbered {count} images top to bottom", "{count} imágenes renumeradas de arriba abajo", "{count} imagens renumeradas de cima para baixo", "{count} Bilder von oben nach unten neu nummeriert", "{count} images renumérotées de haut en bas", "{count} 枚を上から順に振り直しました"),
"welcomeTitle": ("Welcome to Image Number Helper", "Te damos la bienvenida a Image Number Helper", "Boas-vindas ao Image Number Helper", "Willkommen bei Image Number Helper", "Bienvenue dans Image Number Helper", "Image Number Helper へようこそ"),
"welcomeH1": ("You’re set. Say “image 7” and everyone knows which one.", "Listo. Di «imagen 7» y todos sabrán cuál es.", "Tudo pronto. Diga “imagem 7” e todos saberão qual é.", "Fertig. Sag „Bild 7“ und alle wissen, welches gemeint ist.", "C’est prêt. Dites « image 7 » et tout le monde sait laquelle.", "準備完了。「画像 7」と言えば、誰にでも伝わります。"),
"welcomeLede": ("Image Number Helper puts a number on every image so feedback, QA and meetings stop pointing at “the one on the left.”", "Image Number Helper pone un número en cada imagen para que los comentarios, QA y reuniones dejen de señalar «la de la izquierda».", "O Image Number Helper coloca um número em cada imagem para que feedbacks, QA e reuniões parem de apontar para “aquela da esquerda”.", "Image Number Helper versieht jedes Bild mit einer Nummer – Feedback, QA und Meetings zeigen nie wieder auf „das links“.", "Image Number Helper place un numéro sur chaque image : fini « celle de gauche » dans les retours, la QA et les réunions.", "Image Number Helper はすべての画像に番号を付けるので、フィードバックや QA、会議で「左のあれ」と指さす必要がなくなります。"),
"step1T": ("Pin it", "Fíjala", "Fixe a extensão", "Anheften", "Épinglez-la", "ピン留め"),
"step1B_html": ("Click the puzzle icon in Chrome’s toolbar and pin <strong>Image Number Helper</strong>.", "Haz clic en el icono de pieza de puzle de la barra de Chrome y fija <strong>Image Number Helper</strong>.", "Clique no ícone de quebra-cabeça na barra do Chrome e fixe o <strong>Image Number Helper</strong>.", "Klicke in der Chrome-Leiste auf das Puzzle-Symbol und hefte <strong>Image Number Helper</strong> an.", "Cliquez sur l’icône puzzle de la barre Chrome et épinglez <strong>Image Number Helper</strong>.", "Chrome ツールバーのパズルアイコンから <strong>Image Number Helper</strong> をピン留めします。"),
"step2T": ("Number a page", "Numera una página", "Numere uma página", "Seite nummerieren", "Numérotez une page", "ページに番号を付ける"),
"step2B_html": ("Press <kbd>Alt</kbd> <kbd>Shift</kbd> <kbd>N</kbd> or flip the switch in the popup.", "Pulsa <kbd>Alt</kbd> <kbd>Shift</kbd> <kbd>N</kbd> o activa el interruptor del panel.", "Pressione <kbd>Alt</kbd> <kbd>Shift</kbd> <kbd>N</kbd> ou ative o botão no painel.", "Drücke <kbd>Alt</kbd> <kbd>Shift</kbd> <kbd>N</kbd> oder lege den Schalter im Popup um.", "Appuyez sur <kbd>Alt</kbd> <kbd>Shift</kbd> <kbd>N</kbd> ou activez l’interrupteur du panneau.", "<kbd>Alt</kbd> <kbd>Shift</kbd> <kbd>N</kbd> を押すか、ポップアップのスイッチをオンにします。"),
"step3T": ("Click to copy", "Haz clic para copiar", "Clique para copiar", "Klicken zum Kopieren", "Cliquez pour copier", "クリックでコピー"),
"step3B": ("Click any badge to copy “Image 7”. Type a number in the popup to jump straight to it.", "Haz clic en un número para copiar «Imagen 7». Escribe un número en el panel para saltar a esa imagen.", "Clique em um número para copiar “Imagem 7”. Digite um número no painel para ir direto a ela.", "Klicke auf eine Nummer, um „Bild 7“ zu kopieren. Gib im Popup eine Nummer ein, um direkt hinzuspringen.", "Cliquez sur un numéro pour copier « Image 7 ». Tapez un numéro dans le panneau pour y aller directement.", "番号をクリックすると「画像 7」をコピー。ポップアップに番号を入力すると、その画像へジャンプします。"),
"tryTitle": ("Try it on these", "Pruébalo con estas", "Experimente nestas", "Probier es hier aus", "Essayez sur celles-ci", "ここで試してみましょう"),
"tryOn": ("Number these images", "Numerar estas imágenes", "Numerar estas imagens", "Diese Bilder nummerieren", "Numéroter ces images", "これらの画像に番号を付ける"),
"tryJump": ("Jump to #7", "Ir a la n.º 7", "Ir para a nº 7", "Zu Nr. 7 springen", "Aller à la n° 7", "7 番へジャンプ"),
"welcomeNote": ("Free numbers the first 8 images on any page. Pro numbers everything and adds the meeting report, numbered screenshots, colors and positions.", "La versión gratuita numera las 8 primeras imágenes de cada página. Pro numera todo y añade el informe de reunión, capturas numeradas, colores y posiciones.", "A versão grátis numera as 8 primeiras imagens de cada página. O Pro numera tudo e adiciona o relatório de reunião, capturas numeradas, cores e posições.", "Free nummeriert die ersten 8 Bilder jeder Seite. Pro nummeriert alles und bietet Meeting-Bericht, nummerierte Screenshots, Farben und Positionen.", "La version gratuite numérote les 8 premières images de chaque page. Pro numérote tout et ajoute le rapport de réunion, les captures numérotées, les couleurs et les positions.", "無料版は各ページの最初の 8 枚に番号を付けます。Pro ではすべての画像に番号が付き、会議用レポート、番号付きスクリーンショット、色と位置の変更が使えます。"),
"autoAll": ("Number images on every site", "Numerar imágenes en todos los sitios", "Numerar imagens em todos os sites", "Bilder auf allen Websites nummerieren", "Numéroter les images sur tous les sites", "すべてのサイトで番号を付ける"),
"numberStyle": ("Number style", "Estilo de número", "Estilo do número", "Nummernstil", "Style de numéro", "番号のスタイル"),
"founderTitle": ("Founding user", "Usuario fundador", "Usuário fundador", "Nutzer der ersten Stunde", "Utilisateur fondateur", "初期ユーザー"),
"founderLine_html": ("You used Image Number Helper before Pro existed, so <b>Pro is yours free, forever</b>. Thank you!", "Usabas Image Number Helper antes de que existiera Pro, así que <b>Pro es tuyo gratis, para siempre</b>. ¡Gracias!", "Você usava o Image Number Helper antes do Pro existir, então <b>o Pro é seu de graça, para sempre</b>. Obrigado!", "Du hast Image Number Helper schon vor Pro genutzt – deshalb <b>bekommst du Pro gratis, für immer</b>. Danke!", "Vous utilisiez Image Number Helper avant Pro : <b>Pro est à vous, gratuitement et pour toujours</b>. Merci !", "Pro 登場前から Image Number Helper をご利用いただいているため、<b>Pro をずっと無料でお使いいただけます</b>。ありがとうございます！"),
"founderBanner_html": ("<b>Welcome to version 3.</b> As an early user you keep everything — and get every Pro feature free, forever: unlimited numbers, the meeting report, numbered screenshots, jump-to-image and more. Your settings came with you.", "<b>Bienvenido a la versión 3.</b> Como usuario pionero lo conservas todo y además tienes todas las funciones Pro gratis para siempre: números ilimitados, informe de reunión, capturas numeradas, ir a imagen y más. Tu configuración se ha mantenido.", "<b>Boas-vindas à versão 3.</b> Como usuário pioneiro, você mantém tudo e ganha todos os recursos Pro de graça, para sempre: números ilimitados, relatório de reunião, capturas numeradas, ir para imagem e mais. Suas configurações foram mantidas.", "<b>Willkommen bei Version 3.</b> Als früher Nutzer behältst du alles – und bekommst alle Pro-Funktionen gratis, für immer: unbegrenzte Nummern, Meeting-Bericht, nummerierte Screenshots, Bildsprung und mehr. Deine Einstellungen wurden übernommen.", "<b>Bienvenue dans la version 3.</b> En tant qu’utilisateur de la première heure, vous gardez tout et obtenez toutes les fonctions Pro gratuitement, pour toujours : numéros illimités, rapport de réunion, captures numérotées, accès direct à une image, et plus. Vos réglages ont été conservés.", "<b>バージョン 3 へようこそ。</b>初期ユーザーの方はこれまでの機能をそのまま使え、さらに Pro 機能もずっと無料です：番号付けは無制限、会議用レポート、番号付きスクリーンショット、画像へのジャンプなど。設定も引き継がれています。"),
"rateAsk": ("Enjoying Image Number Helper?", "¿Te gusta Image Number Helper?", "Gostando do Image Number Helper?", "Gefällt dir Image Number Helper?", "Image Number Helper vous plaît ?", "Image Number Helper は役に立っていますか？"),
"rateCta": ("Rate it ★", "Valóralo ★", "Avalie ★", "Bewerten ★", "Notez-le ★", "評価する ★"),
"rateNo": ("No thanks", "No, gracias", "Não, obrigado", "Nein danke", "Non merci", "結構です"),
}

def build():
    root = os.path.join(os.path.dirname(__file__), "..", "extension", "_locales")
    for li, lang in enumerate(LANGS):
        out = {}
        for key, vals in S.items():
            assert len(vals) == 6, key
            text = vals[li]
            # Argument order is defined by the English string, for every language.
            names = list(dict.fromkeys(re.findall(r"\{(\w+)\}", vals[0])))
            assert set(re.findall(r"\{(\w+)\}", text)) == set(names), (lang, key)
            msg = re.sub(r"\{(\w+)\}", lambda m: f"${m.group(1).upper()}$", text)
            entry = {"message": msg}
            if names:
                entry["placeholders"] = {n: {"content": f"${i + 1}"} for i, n in enumerate(names)}
            out[key] = entry
        d = os.path.join(root, lang)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "messages.json"), "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
            f.write("\n")
    print(f"wrote {len(S)} strings × {len(LANGS)} languages")

if __name__ == "__main__":
    build()
