## 0.2.0 ##
2021-05-03

* fixed: Bei SR-Modifikator wurde zusätzlich die Behinderung modifiziert (Issue #36)
* Automatisches Scrollen der Fertigkeitsliste wurde wieder entfernt. Stattdessen ausführlicher Tooltip
* Ausführlichere Tooltips
* Verteidigungswerte (VTD, KW, GW) von Gegnern werden nicht mehr im Probendialog und in der Ergebnisnachricht für die Spieler angezeigt. Es kann weiterhin ein Ziel selektiert werden. Im Probendialog steht dann VTD/KW/GW (abhängig vom Wurf), der Zahlenwert wird aber nicht mehr angezeigt. Trotzdem werden die Erfolgsgrade berechnet. Der GM sieht die angesetzte Schwierigkeit
* Neuer Kompendiumbrowser hinzugefügt. Aktuell sind nur Zauber, Meisterschaften und Waffen enthalten. Dies wird später noch erweitert.

## 0.1.8 ##
2021-04-29

* fixed: Fokuskosten und kanalisierter Schaden konnte für "unlinked Actors" nicht abgerechnet werden.
* fixed: Tippfehler in "Modifikatoren"-JournalEntry
* Meisterschaften werden nach Fertigkeit in der selben Reihenfolge dargestellt, wie in der Fertigkeitsliste
* Geht man mit der Maus über eine Fertigkeit in der Fertigkeits- oder Meisterschaftsliste, wird in der jeweils anderen Liste (Meisterschafts-/Fertigkeitsliste) zu dieser Fertigkeit gescrollt und hervorgehoben. Dadurch lassen sich die Fertigkeiten leichter einsehen bevor eine Probe durchgeführt wird.
* Kompatibilität mit dem "VTTA Tokenizer"-Modul. (Dank an Kristian Domke)
* Meisterschaften lassen sich per Drag-n-Drop aus dem Bogen in das ItemDirectory ziehen.


## 0.1.7 ##
2021-04-22

* fixed: Zaubereffekte sind nun Drag-and-Dropable (Issue 30)
* Waffen können nun auch aus dem Inventar per Drag-and-Dop in die Makroleiste gezogen werden
* In der Chatnachricht der Aktiven Abwehr ist nun auch eine "Ticks"-Schaltfläche vorhanden.
* Situative Boni (Meisterschaften) können nun als Modifikator angegeben werden als `<skillId>/<Situation> <Bonus>`. Diese situativen Modifikatoren werden als Liste im Probendialog aufgeführt und können durch anklicken aktiviert werden Bei Zaubern kann als Situation der Zaubertypus angegeben werden. In diesem Fall wird im Probendialog beim entsprechenden Zauber der Modifikator automatisch aktiviert. Wird bei einer Kampffertigkeit ein Angriffsname (Waffenname) angegeben, wird dieser Modifikator beim entsprechenden Probendialog automatisch aktiviert.
* Felder für Geld im Charakterbogen verfügbar.

## 0.1.6 ##
2021-04-20

* fixed: Attribut "Bewegung" zu "Beweglichkeit"
* fixed: Die Last von Gegenständen werden im Inventar angezeigt
* Beim Import eines Charakters aus Genesis kann nun ausgewählt werden, ob alle Daten überschrieben oder aktualisiert werden sollen. (Issue #28)
* Die Ticks-Schaltfläche einer Chatnachricht ändert nun die Ticks des "Speakers" der Nachricht und nicht die des ausgewählten Tokens. (Issue #26)
* Zaubereffekte können nun seperat ein- und ausgeschaltete werden (Issue #21)
* Multiplikator für Erfahrungspunkteschwellen für Heldengrade hinzugefügt
* Fehlende Übersetzung hinzugefügt

## 0.1.5 ##
2021-04-19

* Fixed: Auswahl der Fertigkeit wenn Meisterschaft über Drag-and-Drop hinzugefügt
* Fixed: "Sterbend" war im "Zustand"-Kompendium als Waffe gelistet
* Fixed: max. Splitterpunkte abhängig von Heldengrad (Issue #23)
* Fixed: Meisterschaft konnte nicht direkt im Sheet erstellt werden (Issue #22)
* Neuer Meisterschafts Copy-and-Paste-Importer (Funktioniert nur mit der Formatierung des GRWs)
* Robusterer NPC-Copy-and-Paste-Importer

## 0.1.4 ##
2021-04-16

* Fixed: Bug in der Eingabe von Attributen
* Fixed: Bezeichner für "Willenskraft"
* Robusterer Copy-Paste-Importer (Nun auch Kreaturimport von B&U möglich, Issue #17)
* Min. Attribute für Waffen, Rüstungen und Schilde werden für die Behinderung, Tick-Zuschlag bzw. WGS berücksichtigt
* Der Fertigkeitswert für eine einzelne Waffe kann mittels Modifiaktor angepasst werden
* Notifications beim Import mittels Copy-Paste-Importer
* Fertigkeit-IDs in JournalEntry hinzugefügt (Issue #18)

## 0.1.3 ##
2021-04-14

* Copy-and-Paste-Importer für Stärken und Gegnermerkmale (Es können mehrere Merkmale/Stärken auf einmal kopiert werden. Etwaige Modifikatoren werden automatisch hinzugefügt)
* Es können mehrere Waffen, Rüstungen, Schilde per Copy-and-Paste importiert werden wenn vorher in einem Texteditor jede Waffe/Wüstung/Schild in einer eigenen Zeile steht.
* Fix Issue #16: Kritisch und Defensiv wird jetzt berücksichtig.

## 0.1.2 ##
2021-04-13

* Copy-and-Paste-Importer für Waffen, Rüstungen, Schilde und NPCs

## 0.1.1 ##
2021-04-12

* Robusterer Copy-and-Paste Zauberspruchparser
* Für NPCs werden die Attribute, wenn nicht anders angegeben, auf 0 gesetzt.
* Modifikatoren werden nur für ausgerüstete Gegenstände berücksichtigt. (Issue #13)
* Erfolgsgradoptionen für Zauber in ItemSheet hinzugefügt (Issue #12)
* Erfolgsgradoptionen für Zauber in Chatnachrichten hinzugefügt
* JournalEntry zum Thema "Modifikatoren" hinzugefügt (Issue #14)

## 0.1.0 ##
2021-04-09

* Erste Alpha-Release-Version

## 0.0.53 ##
2021-04-09

* Bug fixes (Issue #6, #7, #8, #9, #10)
* Neue interaktive Chatnachrichten für Fertigkeitswürfe, Angriffe und zauber
* Kampf- und Zauberpatzertabellen hinzugefügt

## 0.0.51 ##
2021-04-01

* Neues Charakterblattlayout
* Schadensreduktion als Wert im Kopf des Charakterblatts hinzugefügt
* Kompatibilität mit Kompendium-Export aus Genesis

## 0.0.49 ##
2021-03-31

* [Zauberimport](feature-copy-paste.md) durch Copy&Paste aus PDFs
* Dialog zur Auswahl der Magieschule bei Drag'n Drop von Zaubern aus einem Kompendium
* Bug fixes(Issue #6, JSON-importer)
* [requestSkillCheck und skillCheckMacro](feature-journal-skillcheck.md)

## 0.0.44 ##