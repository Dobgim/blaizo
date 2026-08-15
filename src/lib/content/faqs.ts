/**
 * The FAQ content.
 *
 * This file is the source of truth. `npm run sync:faqs` pushes it to the
 * database, which is what the site actually reads; the file also serves as the
 * fallback before a Supabase project exists.
 *
 * "Paying for a puppy" comes first on purpose. It is the section this audience
 * scrolls to, and the one where vagueness reads as evasion — a breeder who is
 * breezy about money is the breeder people have been warned about. Every
 * answer in it is written to survive being quoted back at the kennel later.
 *
 * NOTE FOR THE OWNER: two answers state a policy rather than a fact — "Do I
 * pay before or after I have seen the puppy" and "What if I change my mind".
 * Confirm both say what you actually do before launch. They are the two a
 * buyer will hold you to.
 */

export type FaqGroup = {
  category: string;
  items: { question: string; answer: string }[];
};

export const fallbackFaqs: FaqGroup[] = [
  {
    category: "Paying for a puppy",
    items: [
      {
        question: "How do I pay?",
        answer:
          "Open the puppy you want and press Order. You give us your name, email and phone number and say whether you would like to pay by Zelle, Cash App, Chime or Apple Pay. That places the order and gives you an order number — nothing is charged. We then call you, send you video of the puppy, and give you the payment details ourselves. No card is entered on this website and no payment passes through it.",
      },
      {
        question: "Do you take a deposit, or can I pay in instalments?",
        answer:
          "Neither. A puppy is paid for in full or not at all. We would rather you waited until you can pay the whole amount than hold a puppy against a part payment — it is simpler for both of us, and it means nobody is ever half-way into a purchase they cannot finish.",
      },
      {
        question: "How much is a puppy?",
        answer:
          "Between $750 and $800 depending on the puppy, and the price is on each puppy's own page. That is the whole cost — there is no separate registration, paperwork or handling fee added at checkout. Delivery, if you want it, is quoted separately before you commit to anything.",
      },
      {
        question: "Do you take cards, PayPal or a bank transfer?",
        answer:
          "We take Zelle, Cash App, Chime and Apple Pay. Of those, Apple Pay is the one that runs on your card, through Apple Cash. We never take a card number directly, and there is no card form anywhere on this site — if you are ever asked to type one, you are not on our website.",
      },
      {
        question: "Do I pay before or after I have seen the puppy?",
        answer:
          "Payment comes first — but never before we have spoken. We call you and send you video of that particular puppy before you send anything, so you know exactly which dog you are buying and who you are buying from. You are also welcome to come and meet the puppy first if you are local. If any breeder will not get on a call and send you video before taking your money, do not send it. That applies to us as much as to anyone.",
      },
      {
        question: "Is it safe to pay this way?",
        answer:
          "Be careful, and we would rather say so plainly than pretend otherwise. Zelle, Cash App and Chime transfers are fast and very hard to reverse, which is exactly why scammers ask for them. Two things protect you with us. We never publish payment details or email them out of the blue — you get them from a person, on a call you were told to expect, after you have seen video of your puppy. And we will never message you asking you to change them. If anything claiming to be us sends you payment details unprompted, it is not us: call the number on this site.",
      },
      {
        question: "What happens once I have paid?",
        answer:
          "We confirm we have received it, usually the same day, then arrange collection or delivery and go through the paperwork that travels with the puppy. Your order number is the reference for everything after that. If you have not heard from us within a day of sending payment, ring us — do not wait for us to notice.",
      },
      {
        question: "What if I change my mind, or something goes wrong?",
        answer:
          "Tell us and you get your money back. If you change your mind before the puppy has gone home, we refund what you paid in full — we would far rather that than place a puppy with someone who has had second thoughts. If your own vet finds an existing health problem within seventy-two hours of collection that makes the puppy unfit to keep, you may return the puppy and we refund the purchase price in full as well. The rest is set out on the health guarantee page, and it is worth reading before you order rather than after.",
      },
    ],
  },
  {
    category: "Health testing",
    items: [
      {
        question: "What exactly do you test the parents for?",
        answer:
          "Hips and elbows scored by the OFA at two years or older, an annual CAER eye examination by a veterinary ophthalmologist, and a full breed DNA panel. Every certificate is published on that dog's own page, and you are welcome to look them up yourself on the OFA website using the registry number.",
      },
      {
        question: "What happens if a dog does not pass?",
        answer:
          "They are spayed or neutered and they stay here as a family dog, or they go to a pet home we know. They are not bred from, and we do not sell them on as breeding stock to somebody else.",
      },
      {
        question: "Can I see the certificates before I pay?",
        answer:
          "Yes, and you should. They are already on each dog's page, and we will send them to you directly if you would rather have them in writing. If a breeder is reluctant to show you the paperwork before taking your money, that reluctance is the answer to your question.",
      },
    ],
  },
  {
    category: "Applying",
    items: [
      {
        question: "Do I have to apply before I can order?",
        answer:
          "No — you can order a puppy directly. The application is for people who want help choosing, or who are waiting on a litter that has not been born yet. It costs nothing, commits you to nothing, and it is how we get to know a family before a puppy is agreed.",
      },
      {
        question: "How long is the wait?",
        answer:
          "It depends on the litter and on what you are after. We would rather tell you eight months and be right than tell you eight weeks and keep you hoping. Ask us and we will give you the honest number.",
      },
      {
        question: "Would you ever turn me down?",
        answer:
          "Yes, and we do. If we think the timing is wrong for you, or that another breeder suits what you are after better, we will say so and give you two other names. If you have already paid by that point, you get all of it back.",
      },
    ],
  },
  {
    category: "Bringing a puppy home",
    items: [
      {
        question: "How old are they when they leave?",
        answer:
          "Eight weeks, and not a day earlier. The weeks between six and eight are where a puppy learns to be a dog from its mother and its litter, and shortening that costs the dog something it does not get back.",
      },
      {
        question: "What comes with the puppy?",
        answer:
          "A folder with the registration paperwork, the vaccination and worming record, both parents' clearances, the microchip number, the health guarantee, four weeks of insurance, the food they are already eating, and a blanket that smells like their litter.",
      },
      {
        question: "Can you deliver, or do I collect?",
        answer:
          "You are welcome to collect, and most people do. We deliver ourselves within about four hours' drive, or we can arrange a flight nanny who carries the puppy in the cabin. Delivery is quoted separately from the price of the puppy. Puppies do not travel as cargo, in any weather, for any price.",
      },
    ],
  },
  {
    category: "After they are home",
    items: [
      {
        question: "What if my circumstances change?",
        answer:
          "We take the dog back. At eight weeks or at eight years, for any reason, with no questions and no fee. It is written into the contract. No Golden Pup dog ends up in a shelter while we are alive to prevent it.",
      },
      {
        question: "What does the health guarantee actually cover?",
        answer:
          "The full text is on the guarantee page rather than summarised here, because a warranty you have only read a summary of is not much use. Read it before you order, and ask us about anything in it you do not like.",
      },
    ],
  },
];
