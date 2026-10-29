/*
 * HUDDLE — word packs and prompts
 * ---------------------------------------------------------------
 * Edit freely. Each word is "Word | Bible reference | one-line fact | k"
 *   - the reference and fact are optional (they show on Learn More cards)
 *   - a final "k" marks it kid-friendly (used by Kids mode)
 * Scripture wording follows the King James Version (public domain).
 * Kannada words and Bible names use common spellings; please have a
 * Kannada speaker check them before sharing widely.
 */
(function () {
  'use strict';

  var PACKS = [
    { id: 'bchar', name: 'Bible people', kn: 'ಬೈಬಲ್ ವ್ಯಕ್ತಿಗಳು', lang: 'en', on: true, words: [
      'Adam|Genesis 2:7|The first man, formed from the dust of the ground.|k',
      'Eve|Genesis 3:20|Adam named her Eve, “the mother of all living”.|k',
      'Noah|Genesis 6:14|God told him to build an ark of gopher wood.|k',
      'Abraham|Genesis 12:1|God called him to leave his country for a new land.|k',
      'Sarah|Genesis 21:2|She had a son, Isaac, in her old age.|k',
      'Isaac|Genesis 21:3|His name means “laughter”.',
      'Rebekah|Genesis 24:15|She watered the camels of Abraham’s servant.',
      'Jacob|Genesis 32:28|God renamed him Israel.|k',
      'Esau|Genesis 25:33|He sold his birthright for a bowl of stew.',
      'Joseph|Genesis 37:3|His father gave him a coat of many colours.|k',
      'Moses|Exodus 2:3|As a baby he was hidden in a basket among the reeds.|k',
      'Aaron|Exodus 4:14|Moses’ brother, who spoke for him before Pharaoh.',
      'Miriam|Exodus 15:20|She led the women with a timbrel after crossing the Red Sea.',
      'Joshua|Joshua 6:20|He led Israel when the walls of Jericho fell.|k',
      'Rahab|Joshua 2:18|She hung a scarlet cord from her window.',
      'Deborah|Judges 4:4|A prophetess who judged Israel.',
      'Gideon|Judges 7:20|His 300 men used trumpets, pitchers and lamps.',
      'Samson|Judges 16:17|His strength was linked to his uncut hair.|k',
      'Delilah|Judges 16:19|She had Samson’s hair shaved while he slept.',
      'Ruth|Ruth 1:16|She told Naomi, “whither thou goest, I will go”.|k',
      'Naomi|Ruth 1:20|She asked to be called Mara, meaning bitter.',
      'Boaz|Ruth 4:13|He married Ruth; they were David’s great-grandparents.',
      'Hannah|1 Samuel 1:27|She prayed for a son and named him Samuel.',
      'Samuel|1 Samuel 3:10|As a boy he answered, “Speak; for thy servant heareth.”|k',
      'King Saul|1 Samuel 10:1|The first king of Israel.',
      'David|1 Samuel 17:49|A shepherd boy who defeated Goliath with a sling.|k',
      'Goliath|1 Samuel 17:4|A Philistine giant from Gath.|k',
      'Jonathan|1 Samuel 18:1|Saul’s son and David’s closest friend.',
      'Solomon|1 Kings 3:12|God gave him a wise and understanding heart.|k',
      'Elijah|2 Kings 2:11|He went up to heaven in a whirlwind.|k',
      'Elisha|2 Kings 2:13|He picked up Elijah’s mantle.',
      'Queen Jezebel|1 Kings 19:2|She threatened Elijah after Mount Carmel.',
      'Queen Esther|Esther 4:14|“Who knoweth whether thou art come to the kingdom for such a time as this?”|k',
      'Mordecai|Esther 2:7|He raised his cousin Esther.',
      'Nehemiah|Nehemiah 6:15|He led the rebuilding of Jerusalem’s wall in 52 days.',
      'Daniel|Daniel 6:22|God shut the lions’ mouths.|k',
      'Jonah|Jonah 1:17|He spent three days and nights in a great fish.|k',
      'Isaiah|Isaiah 6:8|He said, “Here am I; send me.”',
      'Jeremiah|Jeremiah 1:5|God knew him before he was born.',
      'Job|Job 1:21|He blessed God even after losing everything.',
      'Mary, mother of Jesus|Luke 1:38|She said, “Behold the handmaid of the Lord.”|k',
      'Joseph the carpenter|Matthew 1:24|He obeyed the angel and took Mary as his wife.|k',
      'John the Baptist|Matthew 3:4|He wore camel’s hair and ate locusts and wild honey.|k',
      'Peter|Matthew 4:19|A fisherman Jesus called to be a fisher of men.|k',
      'Andrew|John 1:41|He brought his brother Peter to Jesus.',
      'James|Mark 1:19|A fisherman and son of Zebedee.',
      'John the disciple|John 13:23|The disciple “whom Jesus loved”.',
      'Thomas|John 20:27|Jesus invited him to touch his wounds.|k',
      'Judas Iscariot|Matthew 26:15|He betrayed Jesus for thirty pieces of silver.',
      'Matthew|Matthew 9:9|A tax collector who left his desk to follow Jesus.',
      'Zacchaeus|Luke 19:4|A short man who climbed a sycamore tree to see Jesus.|k',
      'Lazarus|John 11:43|Jesus called him out of the tomb.|k',
      'Martha|Luke 10:40|She was busy serving while Mary listened.',
      'Nicodemus|John 3:2|He came to Jesus by night.',
      'Mary Magdalene|John 20:16|The first to see the risen Jesus.',
      'Pontius Pilate|Matthew 27:24|He washed his hands before the crowd.',
      'King Herod|Matthew 2:16|He tried to destroy the young child Jesus.',
      'Paul|Acts 9:4|He met Jesus on the road to Damascus.|k',
      'Barnabas|Acts 4:36|His name means “son of consolation”.',
      'Timothy|2 Timothy 1:5|He learned faith from his grandmother Lois and mother Eunice.',
      'Stephen|Acts 7:59|The first Christian martyr.',
      'Lydia|Acts 16:14|A seller of purple cloth from Thyatira.',
      'Silas|Acts 16:25|He sang hymns with Paul in prison at midnight.'
    ] },
    { id: 'bstory', name: 'Bible stories', kn: 'ಬೈಬಲ್ ಕಥೆಗಳು', lang: 'en', on: true, words: [
      'Creation|Genesis 1:1|God made the heaven and the earth in six days.|k',
      'Noah’s ark|Genesis 7:9|The animals went in two by two.|k',
      'Tower of Babel|Genesis 11:9|God confused their language.|k',
      'Joseph’s coat of many colours|Genesis 37:3|His brothers grew jealous of it.|k',
      'Jacob’s ladder|Genesis 28:12|He dreamed of angels going up and down.',
      'Baby Moses in a basket|Exodus 2:5|Pharaoh’s daughter found him in the river.|k',
      'The burning bush|Exodus 3:2|The bush burned but was not consumed.|k',
      'Parting the Red Sea|Exodus 14:21|The waters divided and Israel walked through on dry ground.|k',
      'Manna from heaven|Exodus 16:15|Bread from heaven every morning in the wilderness.|k',
      'The Ten Commandments|Exodus 20:3|Given on Mount Sinai.|k',
      'Walls of Jericho|Joshua 6:20|They fell after Israel marched and shouted.|k',
      'Gideon’s trumpets|Judges 7:20|300 men blew trumpets and broke their pitchers.',
      'Samson and the lion|Judges 14:6|He tore a young lion with his bare hands.',
      'David and Goliath|1 Samuel 17:49|One stone from a sling brought the giant down.|k',
      'Elijah on Mount Carmel|1 Kings 18:38|Fire from heaven burned up the sacrifice.',
      'Elijah fed by ravens|1 Kings 17:6|Ravens brought him bread and meat.|k',
      'Daniel in the lions’ den|Daniel 6:22|An angel shut the lions’ mouths.|k',
      'The fiery furnace|Daniel 3:25|A fourth man was seen walking in the fire.|k',
      'The writing on the wall|Daniel 5:5|Fingers of a hand wrote at Belshazzar’s feast.',
      'Jonah and the whale|Jonah 1:17|A great fish swallowed Jonah.|k',
      'The birth of Jesus|Luke 2:7|He was laid in a manger.|k',
      'The shepherds and the angels|Luke 2:13|A multitude of the heavenly host praised God.|k',
      'The wise men’s star|Matthew 2:10|They rejoiced with exceeding great joy.|k',
      'Jesus in the temple at twelve|Luke 2:46|He sat among the teachers, asking questions.',
      'The baptism of Jesus|Matthew 3:16|The Spirit came down like a dove.|k',
      'Water into wine|John 2:9|Jesus’ first miracle, at a wedding in Cana.|k',
      'Feeding the five thousand|John 6:9|A boy had five barley loaves and two small fishes.|k',
      'Walking on water|Matthew 14:29|Peter walked on the water too, until he doubted.|k',
      'Calming the storm|Mark 4:39|“Peace, be still.”|k',
      'Zacchaeus up a tree|Luke 19:5|Jesus said, “To day I must abide at thy house.”|k',
      'Raising Lazarus|John 11:44|He came out still wrapped in grave clothes.|k',
      'The triumphal entry|John 12:13|People took palm branches and went out to meet him.|k',
      'Washing the disciples’ feet|John 13:5|Jesus served his disciples with a towel and basin.',
      'The Last Supper|Luke 22:19|Jesus broke bread: “this do in remembrance of me.”',
      'The empty tomb|Matthew 28:6|“He is not here: for he is risen.”|k',
      'Road to Emmaus|Luke 24:31|They knew him when he broke the bread.',
      'Doubting Thomas|John 20:29|“Blessed are they that have not seen, and yet have believed.”',
      'Pentecost|Acts 2:3|Tongues like fire sat on each of them.',
      'Paul on the road to Damascus|Acts 9:3|A light from heaven shone around him.',
      'Paul’s shipwreck|Acts 27:44|Everyone reached land safely.',
      'Peter freed from prison|Acts 12:7|An angel woke him and his chains fell off.'
    ] },
    { id: 'bparable', name: 'Parables & miracles', kn: 'ಸಾಮ್ಯಗಳು ಮತ್ತು ಅದ್ಭುತಗಳು', lang: 'en', on: true, words: [
      'The good Samaritan|Luke 10:33|He stopped to help a wounded stranger.|k',
      'The prodigal son|Luke 15:20|His father ran to welcome him home.|k',
      'The lost sheep|Luke 15:4|The shepherd left the ninety and nine.|k',
      'The lost coin|Luke 15:8|A woman swept the house until she found it.|k',
      'The sower and the seeds|Matthew 13:3|Seed fell on four kinds of ground.|k',
      'The mustard seed|Matthew 13:31|The smallest seed grows into a great tree.|k',
      'The wise and foolish builders|Matthew 7:24|One built on the rock, the other on sand.|k',
      'The ten virgins|Matthew 25:4|The wise took oil in their vessels with their lamps.',
      'The talents|Matthew 25:21|“Well done, thou good and faithful servant.”',
      'The pearl of great price|Matthew 13:46|A merchant sold all he had to buy it.',
      'The rich fool|Luke 12:20|He built bigger barns but lost his life that night.',
      'The unforgiving servant|Matthew 18:33|He was forgiven much but would not forgive a little.',
      'The persistent widow|Luke 18:3|She kept asking the judge until he gave her justice.',
      'Healing the blind man|John 9:7|Jesus told him to wash in the pool of Siloam.|k',
      'Ten lepers healed|Luke 17:15|Only one came back to say thank you.|k',
      'The great catch of fish|Luke 5:6|Their net began to break.|k',
      'The man let down through the roof|Mark 2:4|His friends uncovered the roof to reach Jesus.|k',
      'Jairus’s daughter|Mark 5:41|“Talitha cumi”: “Damsel, arise.”',
      'The widow’s mite|Mark 12:42|She gave two small coins, all she had.',
      'The coin in the fish’s mouth|Matthew 17:27|Peter found tax money in a fish.|k',
      'Healing the centurion’s servant|Matthew 8:8|“Speak the word only, and my servant shall be healed.”'
    ] },
    { id: 'bplace', name: 'Bible places & things', kn: 'ಸ್ಥಳಗಳು ಮತ್ತು ವಸ್ತುಗಳು', lang: 'en', on: true, words: [
      'Garden of Eden|Genesis 2:8|God planted a garden eastward in Eden.|k',
      'Bethlehem|Micah 5:2|The town where Jesus was born.|k',
      'Nazareth|Luke 2:51|The town where Jesus grew up.|k',
      'Jerusalem|Psalm 122:6|“Pray for the peace of Jerusalem.”|k',
      'Jordan River|Matthew 3:13|Where Jesus was baptised.|k',
      'Sea of Galilee|Matthew 4:18|Where Jesus called fishermen to follow him.|k',
      'Mount Sinai|Exodus 19:20|Where God gave the law to Moses.',
      'Egypt|Exodus 1:8|Where Israel became slaves under a new Pharaoh.|k',
      'Babylon|Daniel 1:1|Where Daniel was taken captive.',
      'Jericho|Joshua 6:1|A walled city that fell to Joshua.|k',
      'Calvary|Luke 23:33|The place where Jesus was crucified.',
      'Mount of Olives|Acts 1:12|Where Jesus ascended into heaven.',
      'Nineveh|Jonah 3:5|The great city that repented when Jonah preached.',
      'Damascus|Acts 9:8|Where Saul was led, blinded, after his vision.',
      'Rome|Acts 28:16|Where Paul lived under guard and kept preaching.',
      'Ark of the covenant|Exodus 25:10|A chest of acacia wood covered with gold.',
      'Five loaves and two fish|John 6:9|A boy’s lunch that fed thousands.|k',
      'Crown of thorns|Matthew 27:29|Soldiers put it on Jesus’ head.',
      'Shepherd’s staff|Psalm 23:4|“Thy rod and thy staff they comfort me.”|k',
      'David’s sling|1 Samuel 17:40|He chose five smooth stones from the brook.|k',
      'David’s harp|1 Samuel 16:23|His playing calmed King Saul.|k',
      'Stone tablets|Exodus 31:18|Written with the finger of God.',
      'Fishing net|Luke 5:5|“At thy word I will let down the net.”|k',
      'Alabaster box|Mark 14:3|A woman poured precious ointment on Jesus.',
      'Olive leaf|Genesis 8:11|The dove brought one back to Noah.|k',
      'Dove|Matthew 3:16|The Spirit came down like a dove.|k',
      'Rainbow|Genesis 9:13|The sign of God’s promise to Noah.|k',
      'Fig tree|Luke 19:4|Zacchaeus climbed a sycamore, a kind of fig tree.',
      'Jar of oil|2 Kings 4:6|The widow’s oil kept flowing until the jars were full.',
      'Golden calf|Exodus 32:4|An idol Israel made while Moses was on the mountain.',
      'Lamp on a stand|Matthew 5:15|Don’t hide your light under a bushel.|k',
      'Burning bush|Exodus 3:2|It burned but was not consumed.|k',
      'Manger|Luke 2:7|Baby Jesus’ first bed.|k',
      'Empty tomb|John 20:5|The linen clothes lay there, but Jesus was risen.|k'
    ] },
    { id: 'every', name: 'Everyday India', kn: 'ದಿನನಿತ್ಯ ಜೀವನ', lang: 'en', on: true, words: [
      'Riding an auto||k', 'Making dosa||k', 'Cricket match||k', 'Traffic jam||k', 'Wedding dance||k', 'Monsoon rain||k', 'Filter coffee', 'Power cut||k',
      'Bus conductor||k', 'Taking a selfie||k', 'Kite flying||k', 'Chai stall', 'Online class||k', 'Video call with grandma||k', 'Tiffin box||k', 'Ironing clothes',
      'Watering plants||k', 'Getting a haircut||k', 'Brushing teeth||k', 'Climbing a coconut tree||k', 'Elephant||k', 'Peacock||k', 'Eating a mango||k', 'Opening an umbrella||k',
      'Riding a scooter', 'Bargaining at the market', 'Missing the bus||k', 'Birthday cake||k', 'Mosquito bite||k', 'Morning walk||k', 'Cooking biryani', 'Rangoli||k',
      'Flying a drone', 'School bell||k', 'Doing homework||k', 'Washing the car', 'Train journey||k', 'Waiting in a queue||k', 'Playing carrom||k', 'Rain-soaked bike ride'
    ].map(function (w) { return w.indexOf('|') < 0 ? w + '||' : w; }) },
    { id: 'kneveryday', name: 'ಕನ್ನಡ ಪದಗಳು', kn: 'ಕನ್ನಡ ಪದಗಳು', en: 'Kannada words', lang: 'kn', on: true, words: [
      'ಮನೆ||k', 'ಮಳೆ||k', 'ಆನೆ||k', 'ನವಿಲು||k', 'ಇಡ್ಲಿ||k', 'ದೋಸೆ||k', 'ಕಾಫಿ', 'ಆಟೋ||k', 'ಬಸ್||k', 'ಮಾವಿನ ಹಣ್ಣು||k', 'ತೆಂಗಿನ ಮರ||k', 'ಛತ್ರಿ||k',
      'ಸೈಕಲ್||k', 'ಕ್ರಿಕೆಟ್||k', 'ಗಾಳಿಪಟ||k', 'ಹಾವು||k', 'ಮೀನು||k', 'ಸೂರ್ಯ||k', 'ಚಂದ್ರ||k', 'ನಕ್ಷತ್ರ||k', 'ಹೂವು||k', 'ಶಾಲೆ||k', 'ಪುಸ್ತಕ||k', 'ಹಾಲು||k',
      'ಮೊಸರು||k', 'ಬಾಳೆಹಣ್ಣು||k', 'ರೈಲು||k', 'ಮದುವೆ', 'ಹಬ್ಬ||k', 'ಕೋತಿ||k', 'ಹಸು||k', 'ಬೆಕ್ಕು||k', 'ನಾಯಿ||k', 'ಹುಲಿ||k', 'ದೋಣಿ||k', 'ವಿಮಾನ||k'
    ] },
    { id: 'knbible', name: 'ಬೈಬಲ್ ಕನ್ನಡ', kn: 'ಬೈಬಲ್ ಕನ್ನಡ', en: 'Bible in Kannada', lang: 'kn', on: true, words: [
      'ನೋಹನ ನಾವೆ|Genesis 7:9|The animals went in two by two.|k',
      'ದಾವೀದ ಮತ್ತು ಗೊಲ್ಯಾತ|1 Samuel 17:49|One stone from a sling brought the giant down.|k',
      'ಯೋನ ಮತ್ತು ದೊಡ್ಡ ಮೀನು|Jonah 1:17|A great fish swallowed Jonah.|k',
      'ಸಿಂಹಗಳ ಗುಹೆಯಲ್ಲಿ ದಾನಿಯೇಲ|Daniel 6:22|An angel shut the lions’ mouths.|k',
      'ಉರಿಯುವ ಪೊದೆ|Exodus 3:2|The bush burned but was not consumed.|k',
      'ಕೆಂಪು ಸಮುದ್ರ|Exodus 14:21|The waters divided for Israel.|k',
      'ಐದು ರೊಟ್ಟಿ ಎರಡು ಮೀನು|John 6:9|A boy’s lunch that fed thousands.|k',
      'ನೀರಿನ ಮೇಲೆ ನಡೆದದ್ದು|Matthew 14:29|Peter walked on the water too.|k',
      'ಒಳ್ಳೆಯ ಸಮಾರ್ಯದವನು|Luke 10:33|He stopped to help a wounded stranger.|k',
      'ತಪ್ಪಿಹೋದ ಮಗ|Luke 15:20|His father ran to welcome him home.|k',
      'ಕಳೆದುಹೋದ ಕುರಿ|Luke 15:4|The shepherd left the ninety and nine.|k',
      'ಮೋಶೆ|Exodus 2:3|As a baby he was hidden in a basket.|k',
      'ಅಬ್ರಹಾಮ|Genesis 12:1|God called him to a new land.|k',
      'ಯೋಸೇಫ|Genesis 37:3|His father gave him a coat of many colours.|k',
      'ಪೇತ್ರ|Matthew 4:19|A fisherman called to be a fisher of men.|k',
      'ಪೌಲ|Acts 9:4|He met Jesus on the road to Damascus.|k',
      'ಮರಿಯ|Luke 1:38|“Behold the handmaid of the Lord.”|k',
      'ಜಕ್ಕಾಯ|Luke 19:4|He climbed a tree to see Jesus.|k',
      'ಸಂಸೋನ|Judges 16:17|His strength was linked to his hair.|k',
      'ರೂತ್|Ruth 1:16|“Whither thou goest, I will go.”|k',
      'ಎಸ್ತೇರ್|Esther 4:14|“For such a time as this.”|k',
      'ಆದಾಮ ಮತ್ತು ಹವ್ವ|Genesis 2:8|They lived in the garden of Eden.|k',
      'ಬೇತ್ಲೆಹೇಮ್|Micah 5:2|The town where Jesus was born.|k',
      'ಯೆರೂಸಲೇಮ್|Psalm 122:6|“Pray for the peace of Jerusalem.”|k',
      'ಕಡೇ ಭೋಜನ|Luke 22:19|“This do in remembrance of me.”',
      'ಖಾಲಿ ಸಮಾಧಿ|Matthew 28:6|“He is not here: for he is risen.”|k',
      'ಮಳೆಬಿಲ್ಲು|Genesis 9:13|The sign of God’s promise to Noah.|k',
      'ಪಾರಿವಾಳ|Genesis 8:11|The dove brought an olive leaf to Noah.|k',
      'ದಾವೀದನ ಕಿನ್ನರಿ|1 Samuel 16:23|His playing calmed King Saul.|k',
      'ಯೆರಿಕೋ ಗೋಡೆಗಳು|Joshua 6:20|They fell after Israel shouted.|k'
    ] },
    { id: 'hum', name: 'Songs to hum', kn: 'ಗುನುಗುವ ಹಾಡುಗಳು', lang: 'en', on: true, songs: true, words: [
      'Amazing Grace||k', 'How Great Thou Art', 'Blessed Assurance', 'Great Is Thy Faithfulness', 'What a Friend We Have in Jesus', 'It Is Well with My Soul', 'Rock of Ages', 'Holy, Holy, Holy',
      'Jesus Loves Me||k', 'This Little Light of Mine||k', 'Silent Night||k', 'Joy to the World||k', 'O Come, All Ye Faithful', 'Hark! The Herald Angels Sing', 'Happy Birthday||k', 'Jingle Bells||k',
      'Twinkle Twinkle Little Star||k', 'Old MacDonald Had a Farm||k', 'Baa Baa Black Sheep||k', 'Jana Gana Mana||k', 'Away in a Manger||k', 'Deep and Wide||k', 'Father Abraham||k', 'Give Me Oil in My Lamp||k'
    ].map(function (w) { return w.indexOf('|') < 0 ? w + '||' : w; }) }
  ];

  // Forbidden Words: [word, banned words, reference]
  var FORBID = [
    ['Noah', ['Ark', 'Flood', 'Animals', 'Rain'], 'Genesis 6', 1], ['Moses', ['Egypt', 'Red Sea', 'Commandments', 'Pharaoh'], 'Exodus 14', 1],
    ['David', ['Goliath', 'Sling', 'King', 'Harp'], '1 Samuel 17', 1], ['Jonah', ['Whale', 'Fish', 'Nineveh', 'Swallowed'], 'Jonah 1', 1],
    ['Zacchaeus', ['Tree', 'Short', 'Tax', 'Jesus'], 'Luke 19', 1], ['Daniel', ['Lions', 'Den', 'Pray', 'King'], 'Daniel 6', 1],
    ['Christmas', ['Jesus', 'December', 'Star', 'Manger'], 'Luke 2', 1], ['Easter', ['Tomb', 'Risen', 'Cross', 'Sunday'], 'Matthew 28', 1],
    ['Samson', ['Strong', 'Hair', 'Delilah', 'Lion'], 'Judges 16', 1], ['Good Samaritan', ['Road', 'Robbers', 'Helped', 'Neighbour'], 'Luke 10', 1],
    ['Peter', ['Fisherman', 'Rock', 'Denied', 'Disciple'], 'Matthew 16', 1], ['Manna', ['Bread', 'Desert', 'Heaven', 'Israelites'], 'Exodus 16', 0],
    ['Esther', ['Queen', 'King', 'Jews', 'Mordecai'], 'Esther 4', 0], ['Goliath', ['Giant', 'David', 'Stone', 'Philistine'], '1 Samuel 17', 1],
    ['Garden of Eden', ['Adam', 'Eve', 'Snake', 'Apple'], 'Genesis 2', 1], ['Last Supper', ['Bread', 'Wine', 'Disciples', 'Judas'], 'Luke 22', 0],
    ['Ten Commandments', ['Moses', 'Rules', 'Stone', 'Sinai'], 'Exodus 20', 1], ['Bethlehem', ['Born', 'Town', 'Jesus', 'Manger'], 'Luke 2', 1],
    ['Cricket', ['Bat', 'Ball', 'Wicket', 'IPL'], '', 1], ['Dosa', ['Chutney', 'Sambar', 'Breakfast', 'Crispy'], '', 1],
    ['Monsoon', ['Rain', 'Umbrella', 'Wet', 'Clouds'], '', 1], ['Auto rickshaw', ['Meter', 'Three', 'Driver', 'Ride'], '', 1],
    ['Wedding', ['Bride', 'Groom', 'Ring', 'Marry'], '', 0], ['Mango', ['Fruit', 'Yellow', 'Summer', 'Sweet'], '', 1],
    ['Choir', ['Sing', 'Church', 'Songs', 'Voices'], '', 1], ['Sunday school', ['Children', 'Teacher', 'Bible', 'Church'], '', 1],
    ['Elephant', ['Trunk', 'Big', 'Grey', 'Tusks'], '', 1], ['Birthday', ['Cake', 'Candles', 'Party', 'Age'], '', 1],
    ['Teacher', ['School', 'Class', 'Students', 'Lessons'], '', 1], ['Train', ['Track', 'Station', 'Engine', 'Ticket'], '', 1]
  ];

  var CATS = [
    ['Books of the Bible', 1], ['The twelve disciples', 1], ['Animals in Noah’s ark', 1], ['Things in a kitchen', 1], ['Places in Karnataka', 1], ['Indian sweets', 1],
    ['Worship songs', 1], ['Bible kings', 0], ['Women of the Bible', 1], ['Miracles of Jesus', 1], ['Things at a wedding', 0], ['Cricket players', 1],
    ['Fruits', 1], ['Breakfast foods', 1], ['Things that fly', 1], ['Colours', 1], ['Bible cities', 0], ['School subjects', 1], ['Things in a church', 1], ['Vegetables', 1],
    ['Parables of Jesus', 0], ['Animals in the Bible', 1], ['Things you take on a trip', 1], ['Indian states', 1], ['Bollywood films', 0], ['Board games', 1]
  ];

  var LIKELY = [
    ['…arrive late to church', 1], ['…eat the last samosa', 1], ['…start a dance-off at a wedding', 1], ['…forget their Bible at home', 1], ['…cry at a movie', 1],
    ['…fall asleep during the sermon', 0], ['…become a pastor', 0], ['…win a Bible quiz', 1], ['…get lost on a trip', 1], ['…talk their way out of trouble', 1],
    ['…sing the loudest in church', 1], ['…bring snacks for everyone', 1], ['…forget a birthday', 1], ['…laugh at their own joke', 1], ['…volunteer first', 1],
    ['…take 100 selfies on a trip', 1], ['…finish a Bible reading plan', 1], ['…become famous', 1], ['…cook the best biryani', 0], ['…reply last on WhatsApp', 0],
    ['…have a pet dinosaur', 1], ['…win a spelling bee', 1], ['…make everyone laugh', 1], ['…lose their slippers', 1]
  ];

  var CHALLENGES = [
    ['Sing the chorus of your favourite worship song', 1], ['Act out Moses parting the Red Sea', 1], ['Say Genesis to Ruth in 20 seconds', 0],
    ['Give the person on your left a genuine compliment', 1], ['Do your best auto driver impression', 1], ['Name all twelve disciples', 0],
    ['Hum a hymn until someone guesses it', 1], ['Walk like a camel across the room', 1], ['Say a Bible verse from memory', 1],
    ['Tell a clean joke that makes someone laugh', 1], ['Explain cricket in 30 seconds', 1], ['Speak only in Kannada for one minute', 1],
    ['Act out Zacchaeus climbing the tree', 1], ['Name five kings of Israel', 0], ['Say the four Gospels while doing jumping jacks', 1],
    ['Share your favourite church camp memory', 1], ['Freeze like a statue until your next turn', 1], ['Thank someone here for something specific', 1],
    ['Make the sounds of Noah’s animals boarding the ark', 1], ['Say the alphabet backwards', 0], ['Draw a fish in the air with your elbow', 1],
    ['Pretend to be David facing Goliath', 1], ['Pray for the person on your right', 1], ['Do a news report about Jonah', 1]
  ];

  // Fill the Verse: [before, missing word, after, reference, kid-friendly]
  var VERSES = [
    ['For God so loved the', 'world', ', that he gave his only begotten Son.', 'John 3:16', 1],
    ['The LORD is my', 'shepherd', '; I shall not want.', 'Psalm 23:1', 1],
    ['I can do all things through', 'Christ', ' which strengtheneth me.', 'Philippians 4:13', 1],
    ['In the beginning God created the heaven and the', 'earth', '.', 'Genesis 1:1', 1],
    ['Thy word is a', 'lamp', ' unto my feet, and a light unto my path.', 'Psalm 119:105', 1],
    ['Trust in the LORD with all thine heart; and lean not unto thine own', 'understanding', '.', 'Proverbs 3:5', 0],
    ['Ye are the', 'light', ' of the world.', 'Matthew 5:14', 1],
    ['Jesus', 'wept', '.', 'John 11:35', 1],
    ['I am the way, the', 'truth', ', and the life.', 'John 14:6', 1],
    ['For all have sinned, and come short of the', 'glory', ' of God.', 'Romans 3:23', 0],
    ['For the', 'wages', ' of sin is death; but the gift of God is eternal life.', 'Romans 6:23', 0],
    ['He that loveth not knoweth not God; for God is', 'love', '.', '1 John 4:8', 1],
    ['Be', 'still', ', and know that I am God.', 'Psalm 46:10', 1],
    ['They shall mount up with wings as', 'eagles', '.', 'Isaiah 40:31', 1],
    ['Be strong and of a good', 'courage', '; be not afraid.', 'Joshua 1:9', 1],
    ['But seek ye first the', 'kingdom', ' of God, and his righteousness.', 'Matthew 6:33', 0],
    ['Now', 'faith', ' is the substance of things hoped for.', 'Hebrews 11:1', 0],
    ['This is the day which the LORD hath made; we will', 'rejoice', ' and be glad in it.', 'Psalm 118:24', 1],
    ['Train up a', 'child', ' in the way he should go.', 'Proverbs 22:6', 1],
    ['Pray without', 'ceasing', '.', '1 Thessalonians 5:17', 1],
    ['Let every thing that hath', 'breath', ' praise the LORD.', 'Psalm 150:6', 1],
    ['And ye shall know the truth, and the truth shall make you', 'free', '.', 'John 8:32', 1],
    ['But the', 'fruit', ' of the Spirit is love, joy, peace.', 'Galatians 5:22', 1],
    ['Children, obey your', 'parents', ' in the Lord: for this is right.', 'Ephesians 6:1', 1],
    ['O give thanks unto the LORD; for he is', 'good', '.', 'Psalm 136:1', 1],
  ];

  // Odd One Out: [four words, odd one, why, kid-friendly]
  var ODDS = [
    [['Peter', 'Andrew', 'Paul', 'John'], 'Paul', 'Paul wasn’t one of the twelve disciples', 1],
    [['Genesis', 'Exodus', 'Matthew', 'Leviticus'], 'Matthew', 'The rest are books of Moses', 0],
    [['Matthew', 'Mark', 'Luke', 'Acts'], 'Acts', 'The rest are Gospels', 1],
    [['Gold', 'Frankincense', 'Myrrh', 'Silver'], 'Silver', 'The wise men brought the other three', 1],
    [['Shem', 'Ham', 'Japheth', 'Isaac'], 'Isaac', 'The rest are Noah’s sons', 0],
    [['Mary', 'Martha', 'Lazarus', 'Nicodemus'], 'Nicodemus', 'The rest were siblings in Bethany', 0],
    [['Love', 'Joy', 'Peace', 'Anger'], 'Anger', 'The rest are fruit of the Spirit', 1],
    [['Abraham', 'Isaac', 'Jacob', 'Moses'], 'Moses', 'The rest are the patriarchs', 0],
    [['Lion', 'Bear', 'Giant', 'Wolf'], 'Wolf', 'David faced a lion, a bear and a giant', 1],
    [['Bethlehem', 'Nazareth', 'Jerusalem', 'Rome'], 'Rome', 'The rest are in the land of Israel', 1],
    [['Loaves', 'Fish', 'Wine', 'Rice'], 'Rice', 'The rest appear in Jesus’ miracles', 1],
    [['Mango', 'Jackfruit', 'Banana', 'Carrot'], 'Carrot', 'The rest are fruits', 1],
    [['Idli', 'Dosa', 'Vada', 'Pizza'], 'Pizza', 'The rest are South Indian breakfasts', 1],
    [['Mysuru', 'Mangaluru', 'Hubballi', 'Chennai'], 'Chennai', 'The rest are in Karnataka', 1],
    [['Lion', 'Tiger', 'Leopard', 'Elephant'], 'Elephant', 'The rest are big cats', 1],
    [['Red', 'Blue', 'Yellow', 'Square'], 'Square', 'The rest are colours', 1]
  ];

  function parse(p) {
    return p.words.map(function (s) {
      var a = s.split('|');
      return { w: a[0], ref: a[1] || '', fact: a[2] || '', kid: a[3] === 'k' || a[1] === 'k' || a[2] === 'k', pack: p.id };
    });
  }

  window.HuddleData = {
    PACKS: PACKS.map(function (p) { return { id: p.id, name: p.name, kn: p.kn, en: p.en || p.name, lang: p.lang, on: p.on, songs: !!p.songs, items: parse(p) }; }),
    FORBID: FORBID.map(function (f) { return { w: f[0], ban: f[1], ref: f[2], kid: !!f[3] }; }),
    CATS: CATS.map(function (c) { return { w: c[0], kid: !!c[1] }; }),
    LIKELY: LIKELY.map(function (c) { return { w: c[0], kid: !!c[1] }; }),
    CHALLENGES: CHALLENGES.map(function (c) { return { w: c[0], kid: !!c[1] }; }),
    VERSES: VERSES.map(function (v) { return { before: v[0], word: v[1], after: v[2], ref: v[3], kid: !!v[4] }; }),
    ODDS: ODDS.map(function (o) { return { words: o[0], odd: o[1], why: o[2], kid: !!o[3] }; })
  };
})();
