## 0.7.0 ##
2021-12-28
Das System ist nun für Version 9 von Foundry VTT kompatibel
* changed: veraltete API-Funktionen auf neue geändert
* fixed: Aus "Geschichten und Mythen" wurde "Geschichte und Mythen"! VORSICHT: Dies kann zu Kompatibilitätsproblemen mit Modifikatoren führen.

## 0.6.3 HOTFIX ##
2021-12-14
* fixed: Der Kampffertigkeitswert von NSCs wurde bei Anwendundung von Schaden erhöht (Issue #66)
* fixed: Die Regeneration bei Ruhephase wurde falsch berechnet (Issue #67)
* fixed: Modifilator GSW.mult wurde nicht richtig angewendet (Issue #71)
* fixed: Tooltip für KW und GW

## 0.6.2 ##
2021-10-29
* added: Die Meisterschaft "Großmeister" ist nun implementiert. Eine Meisterschaft kann als "Großmeister"-Meisterschaft markiert werden (Haken in Meisterschaftseigenschaften). Ist Diese Meisterschaft vorhanden, werden automatisch "Großmeister"-Würfe bei entsprechender Fertigkeits-Probe geworfen.
* added: Mondzeichen können jetzt aus dem Charakterblatt hinzugefügt werden (wenn noch kein Mondzeichen hinzugefügt wurde.)
* fixed: Fehlerhaftes parsen im NSC-Copy-and-Paste-Importer
* fixed: Malus für "min. Attribute" bei Waffen wurde falsch berechnet
* fixed: Für die Fertigkeit "Tierführung" waren die falschen Attribute hinterlegt

## 0.6.1 ##
2021-10-18
* added: Dokumentation für fehlende Modifikatoren
* added: Verminderte Patzerstufen werden in Chatnachricht dargestellt
* added: Es können mehrere Zauber gleichzeitig mittels Copy-and-Paste-Importer hinzugefügt werden (Dank geht an Jean-Pierre für diese Erweiterung)
* fixed: Bug in NSC-Sheet wenn nur Fertigkeitswerte (statt Punkte) definiert wurden
* fixed: Darstellung der Patzertabellen in Chatnachricht korrigiert
* fixed: Tooltip in Lebenspunkteelement falsch (Issue #53)
* fixed: Kompatible FVVT-Core-Version wurde auf aktuelle Version angepasst

## 0.6.0 ##
2021-08-10
* added: Neues Design das nun die Möglichkeit bietet Themes zu erstellen
* added: 3 neue UI-Themes (einstellbar in den System-Einstellungen)

* removed: legacy 0.7.x code

## 0.5.0 ##
2021-07-12
* added: Tick Bar for a more Splittermond-like Combat Tracker experience
* removed: 0.7.x support

## 0.4.8 ##
2021-07-12
* fixed: Combat Tracker problems with FVTT 0.7.x

## 0.4.7 HOTFIX ##
2021-07-12
* fixed: Hilfetext für Modifikatoren und minimale Attribute in Item-Sheets

## 0.4.6 ##
2021-07-12
* added: Hilfetext für Modifikatoren und minimale Attribute in Item-Sheets
* changed: Robusteres parsen der Modifikatoren (case insensitive) und "minimalen Attribute"
* changed: Situative Modifikatoren in "Modifikatoren"-JournalEntry hinzugefügt (inkl. Beispiele)
* fixed: Malusberechnung für minimale Attribute von Waffen/Schilden
* fixed: Fehler bei Nutzung des mitgelieferten Foundry-VTT-Clients unter 0.7.x
* fixed: CombatTracker für Version 0.7.x

## 0.4.5 ##
2021-06-30
* added: Es kann nun eine Aktive Abwehr aus der Angriffs-Chatnachricht initiiert werden.
* changed: Combat Tracker: Bei gleicher Initiative gilt für die Kampfreihenfolge die höhere Intuition (GRW S. 157)

## 0.4.4 ##
2021-06-21
* added: Der Schaden von Schadenswürfen kann mit dem Button "Schaden anwenden" auf selektierte Token angewendet werden (nur GM). Dazu öffnet sich ein weiterer Dialog in dem der Schaden modifiziert werden kann.
* added: Die Quelle des Schadens wird in der Chatnachricht des Schadenswurfs angezeigt.
* added: Unter "Fertigkeiten" im Spielercharakterblatt werden alle Fertigkeiten ausgeblendet in denen keine Fertigkeitspunkte vergeben wurden (Gleiche Funktionalität wie bei NSCs). Durch einen Klick auf das Augesymbol lassen sich alle Fertigkeiten einblenden.
* fixed: Fokuskostenparser hat fehlerhafte Kosten ausgegeben
* fixed: Modifikatoren von abgeleitete Werten wurden im NSC-Sheet mehrfach angewendet

## 0.4.3 HOTFIX ##
2021-06-19
* fixed: Schadenschaltfläche in Chatnachricht funktioniert nicht

## 0.4.2 HOTFIX ##
2021-06-18
* fixed: Schadenschaltfläche wurde in Chatnachricht nicht angezeigt

## 0.4.1 HOTFIX ##
2021-06-18
* fixed: Fokusabrechnung in Chatnachricht funktioniert nicht

## 0.4.0 ##
2021-06-18

* added: Ausrüstungsgegenstände können Schaden annehmen. Die "Gesundheitsstufe" von Waffen beeinflusst den Fertigkeitswert. Die Haltbarkeit wird automatisch anhand der Last und Härte des Objekts bestimmt.
* added: In "Kampf" werden nun mehr Informationen zur Kampffertigkeit im Tooltip angezeigt (Modifikatoren etc.)
* added: +/--Schaltflächen bei numerischen Feldern
* added: Fokuspunkte können in der entsprechenden Chatnachricht direkt verrechnet werden
* added: Mit `@Ticks[5 Ticks,<Beschreibung>]` kann in JournalEntries und Chatnachrichten eine interaktive Schaltfläche erstellt werden, um die entsprechende Tickanzahl vorranzuschreiten. Dieser Befehl wird unteranderem in den Patzernachrichten verwendet.
* changed: Die Patzertabellen wurde neu implementiert. Dadurch fällt die Notwendigkeit weg Macros für die Spieler freizugeben. Trotzdem gibt es weiterhin Makros, die es erlauben manuell auf die Patzertabelle würfeln zu lassen (Wenn keine Chatnachricht hierfür vorhanden ist). Mit einem Klick auf die Patzernachricht, lassen sich alle Einträge in der Patzertabelle ein- und ausblenden.
* changed: Fertigkeitsprobeanfragen wurden neu implementiert. Auch hier müssen keine Macros mehr für die Spieler freigegeben werden. Der Chatbefehl für eine Fertigkeitsprobeanfrage lautet beispielsweise `@SkillCheck[Wahrnehmung gegen 18]`. Für den Spielleiter steht hierfür auch ein Makro (Fertigkeitsprobe anfragen) zur Verfügung. Innerhalb von JournalEntries lässt sich eine Anfrage mit `@RequestSkillCheck[Wahrnehmung gegen 18]` einfügen.
* fixed: Wundmalus wurde falsch berechnet

## 0.3.4 ##
2021-06-16

* added: +/--Schaltflächen für Splitterpunkte, Schaden sowie Schwierigkeit und Modifikator im Probendialog
* added: Icons in der Zauberliste
* changed: Überarbeitung der CSS-Organisation

## 0.3.3 ##
2021-06-11

* added: Der Wurfmodus (Sichtbarkeit des Wurfes) kann im Wurfdialog direkt angegeben werden
* added: Der maximale Bonus aus Ausrüstung und Zauber kann per Modifikator (z.B. `bonusCap +1`) verändert werden (Issue #40)
* fixed: Probleme bei der Darstellung der Schadensreduktion (Issue #44)

## 0.3.2 ##
2021-06-09

* added: Buttons in Chatnachrichten werden nur für Spielleiter und Owner angezeigt.
* fixed: Probleme mit Merkmalen bei Schadenswürfen (Issue #46 und #48)
* fixed: NPC-Sheet-Probleme in (0.8.6). Modifikatoren wurden bei jedem Schließen des Sheets erneut angewendet.
  
## 0.3.1 ##
2021-06-02

* fixed: Tick-Button in Chat-Nachricht hat nicht funktioniert
* fixed: NPC-Importer stürzt ab wenn keine Meisterschaft angegeben ist
* fixed: Kompatibilitätsprobleme (0.8.6) in NPC-Importer bei Kompendium-Lookup für Zauber, Meisterschaften etc.
* fixed: Kompatibilitätsprobleme (0.8.6) in Genesis-Import 

## 0.3.0 ##
2021-05-28

* added: Kompatibilität mit Foundry VTT 0.8.x
* added: Journal Style überarbeitet
* added: Mehr Informationen über einen Fertigkeitswurf (Fertigkeit, Angriff oder Zauberspruch) bei Klick auf das Ergebnis in der Chantnachricht
* added: Erweiterte Chatnachricht für Schadenswürfe
* added: Beim Import von Genesis-Daten werden die Schwerpunktmeisterschaften automatisch als Modifikator 
* fixed: Schwächen lassen sich nun auf den Charakterbogen ziehen
* fixed: Fehlerbehandlung bei fehlerhafter Modifikatoreingabe

## 0.2.2 ##
2021-05-12

* fixed: Kompendium Browser wurde nicht richtig geladen, wenn Zauber aber keine Meisterschaften und/oder Waffen angelegt wurden.
* fixed: Beim Drag-and-Drop einer Meisterschaft auf den Charakterbogen wurde die Fertigkeit nicht richtig augewählt.

## 0.2.1 ##
2021-05-07

* fixed: Fehler bei der Berechnung der abgeleiteten Werte für NSCs (Issue #38)
* fixed: Für Fernkampfwaffen werden im "Ticks"-Button "3 Ticks" zum Auslösen verwendet.  (Issue #41)
* Für jedes Attribut kann nun der Startwert angegeben werden. Der maximal mögliche Wert wird mit der Heldenstufe berechnet (Issue #42)
* Klickt man im Combat-Tracker auf den Initiativwert, kann man eine Tickdauer hinzufügen, auch wenn man nicht im Zug ist. Dies kann nur der "Owner" (Besitzer des Charakters oder GM).


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